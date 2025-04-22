import express from 'express';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { authenticateUser } from "../middleware/authMiddleware";
import { handleProfileUpload } from '../middleware/profileUploadMiddleware';
import emailService from '../services/emailService';
import crypto from 'crypto';
import twilio from 'twilio';

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
// Send OTP via WhatsApp using Twilio
router.post(
  '/send-phone-otp',
  [
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('countryIsoCode').notEmpty().withMessage('Country code is required'),
    body('channel').isIn(['sms', 'whatsapp']).withMessage('Invalid channel specified'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array(), success: false });
        return;
      }

      const { phone, countryIsoCode, channel } = req.body;

      // Check if phone already exists
      const existingUser = await prisma.user.findFirst({
        where: { phone }
      });

      // If user exists and already verified, don't allow resending OTP
      if (existingUser && existingUser.isPhoneVerified) {
        res.status(400).json({ 
          message: 'Phone number already registered and verified',
          success: false 
        });
        return;
      }

      // Generate new OTP
      const otp = generateOTP();
      
      // Hash OTP before storing it
      const salt = await bcrypt.genSalt(10);
      const hashedOTP = await bcrypt.hash(otp, salt);
      
      // Set OTP expiry time (10 minutes from now)
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);
      
      // Store OTP data in database (either update existing record or create new one)
      const phoneVerification = await prisma.phoneVerification.upsert({
        where: { phone },
        update: {
          otpHash: hashedOTP,
          expiresAt: expiryTime,
          attempts: 0, // Reset attempts counter on resend
          countryIsoCode,
          updatedAt: new Date()
        },
        create: {
          phone,
          otpHash: hashedOTP,
          expiresAt: expiryTime,
          attempts: 0,
          countryIsoCode,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Prepare message
      const message = `Your Digital Drop verification code is: ${otp}. This code will expire in 10 minutes.`;
      
      // Send message via chosen channel (WhatsApp or SMS)
      if (channel === 'whatsapp') {
        // Send via WhatsApp
        await twilioClient.messages.create({
          from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
          body: message,
          to: `whatsapp:${phone}`
        });
      } else {
        // Send via SMS (fallback)
        await twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER || '',
          body: message,
          to: phone
        });
      }

      res.json({
        success: true,
        message: `Verification code sent via ${channel}. Valid for 10 minutes.`,
        expiresAt: expiryTime
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ 
        message: 'Server error: ' + (error instanceof Error ? error.message : String(error)),
        success: false 
      });
    }
  }
);

// Verify OTP and register/authenticate user
router.post(
  '/verify-phone-otp',
  [
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit OTP is required'),
    body('countryIsoCode').notEmpty().withMessage('Country code is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array(), success: false });
        return;
      }

      const { phone, otp, countryIsoCode } = req.body;

      // Find phone verification record
      const verification = await prisma.phoneVerification.findUnique({
        where: { phone }
      });

      // Check if verification record exists
      if (!verification) {
        res.status(400).json({ 
          message: 'Invalid phone number or OTP not requested',
          success: false 
        });
        return;
      }

      // Check if OTP is expired
      if (verification.expiresAt < new Date()) {
        res.status(400).json({ 
          message: 'Verification code has expired. Please request a new one.',
          success: false,
          expired: true
        });
        return;
      }

      // Check if max attempts exceeded
      if (verification.attempts >= 5) {
        res.status(400).json({ 
          message: 'Max verification attempts exceeded. Please request a new code.',
          success: false,
          maxAttemptsExceeded: true
        });
        return;
      }

      // Validate OTP
      const isOtpValid = await bcrypt.compare(otp, verification.otpHash);
      
      // If invalid, increment attempts counter
      if (!isOtpValid) {
        await prisma.phoneVerification.update({
          where: { phone },
          data: {
            attempts: verification.attempts + 1,
            updatedAt: new Date()
          }
        });

        res.status(400).json({ 
          message: 'Invalid verification code',
          success: false,
          remainingAttempts: 5 - (verification.attempts + 1)
        });
        return;
      }

      // Find existing user with this phone number
      const existingUser = await prisma.user.findFirst({
        where: { phone }
      });

      let user;

      if (existingUser) {
        // Update existing user
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            isPhoneVerified: true,
            updatedAt: new Date(),
            // If this is a re-verification, don't change other fields
          }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            phone,
            email: `${phone}@drop.app`,
            password: await bcrypt.hash('defaultPassword123', 10), // Placeholder hashed password
            isPhoneVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
      }

      // Delete verification record after successful verification
      await prisma.phoneVerification.delete({
        where: { phone }
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      // Response format for consistency with other auth endpoints
      const response = {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name || '',
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          profileImageUrl: user.profile_image_url || undefined,
          isProfileComplete: Boolean(user.name && user.phone),
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: true,
        },
        success: true,
      };

      res.json(response);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ 
        message: 'Server error: ' + (error instanceof Error ? error.message : String(error)),
        success: false 
      });
    }
  }
);
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImageUrl?: string;
    isProfileComplete: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
  success: boolean;
}
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
// ✅ Register User
router.post(
    '/register',
    [
      body('email').isEmail().withMessage('Valid email required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
  
        const { email, password } = req.body;
  
        // ✅ Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
  
        if (existingUser) {
          res.status(400).json({ message: 'Email already in use' });
          return;
        }
  
        // ✅ Generate Salt & Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
  
        // ✅ Create User
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            isEmailVerified: false,
            isPhoneVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
  
        // ✅ Generate JWT Token
        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  
        const response: AuthResponse = {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name || '',
            firstName: newUser.firstName || undefined,
            lastName: newUser.lastName || undefined,
            profileImageUrl: newUser.profile_image_url || undefined,
            isProfileComplete: Boolean(newUser.name && newUser.email),
            isEmailVerified: true,
            isPhoneVerified: true,
          },
          success: true,
        };
  
        res.status(201).json(response);
      } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );


// ✅ Login User
router.post(
    '/login',
    [
      body('email').isEmail().withMessage('Valid email required'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
  
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ 
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            profile_image_url: true,
            firstName: true,
            lastName: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            phone: true,
          }
        });  
        if (!user) {
          res.status(400).json({ message: 'Invalid credentials' });
          return;
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          res.status(400).json({ message: 'Invalid credentials' });
          return;
        }
  
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
        const response: AuthResponse = {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || '',
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            phone: user.phone || undefined,
            profileImageUrl: user.profile_image_url || undefined,
            isProfileComplete: Boolean(user.name && user.email),
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
          },
          success: true,
        };
  
        res.json(response);      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
    }
  );
  

// ✅ Protected route (only accessible if logged in)
router.get("/protected", authenticateUser, (req, res) => {
    res.json({ message: "You have access to this protected route!", userId: req.user?.userId });
  });

  router.get("/debug/users", async (_req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  });
// Add Profile endpoint
router.get('/profile', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        profile_image_url: true,
        phone: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found', success: false });
      return;
    }

    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profileImageUrl: user.profile_image_url || undefined,
        phone: user.phone || undefined,
        isProfileComplete: Boolean(user.name && user.email),
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

router.post('/complete-profile', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    await handleProfileUpload(req, res);


      const { firstName, lastName } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName) {
        res.status(400).json({ 
          message: 'First name and last name are required',
          success: false 
        });
        return;
      }

      const updateData: any = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        updatedAt: new Date(),
      };

      // Add profile image if uploaded
      if (req.file) {
        updateData.profile_image_url = `/uploads/profiles/${req.file.filename}`;
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: req.user?.userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          profile_image_url: true,
          phone: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      const response: AuthResponse = {
        token: req.headers.authorization?.split(' ')[1] || '',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name || '',
          firstName: updatedUser.firstName || undefined,
          lastName: updatedUser.lastName || undefined,
          phone: updatedUser.phone || undefined,
          profileImageUrl: updatedUser.profile_image_url || undefined,
          isProfileComplete: true,
          isEmailVerified: updatedUser.isEmailVerified,
          isPhoneVerified: updatedUser.isPhoneVerified,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
        success: true,
      };

      res.json(response);
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

// Add update profile endpoint without image
router.put('/profile', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName) {
      res.status(400).json({ 
        message: 'First name and last name are required',
        success: false 
      });
      return;
    }

    const updateData: any = {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      updatedAt: new Date(),
    };

    // Add optional fields if provided
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: req.user?.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        profile_image_url: true,
        phone: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name || '',
        firstName: updatedUser.firstName || undefined,
        lastName: updatedUser.lastName || undefined,
        phone: updatedUser.phone || undefined,
        profileImageUrl: updatedUser.profile_image_url || undefined,
        isProfileComplete: Boolean(updatedUser.name && updatedUser.email),
        isEmailVerified: updatedUser.isEmailVerified,
        isPhoneVerified: updatedUser.isPhoneVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

// Add delete profile image endpoint
router.delete('/profile/image', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        profile_image_url: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found', success: false });
      return;
    }

    // Check if user has a profile image
    if (!user.profile_image_url) {
      res.status(400).json({ message: 'No profile image to delete', success: false });
      return;
    }

    // Path to the file on the server
    const profileImagePath = path.join(__dirname, '..', '..', 'public', user.profile_image_url);

    // Delete the file if it exists
    if (fs.existsSync(profileImagePath)) {
      fs.unlinkSync(profileImagePath);
    }

    // Update the user record to remove the profile image reference
    const updatedUser = await prisma.user.update({
      where: { id: req.user?.userId },
      data: {
        profile_image_url: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        profile_image_url: true,
        phone: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        firstName: updatedUser.firstName || undefined,
        lastName: updatedUser.lastName || undefined,
        profileImageUrl: updatedUser.profile_image_url || undefined,
        phone: updatedUser.phone || undefined,
        isProfileComplete: Boolean(updatedUser.name && updatedUser.email),
        isEmailVerified: updatedUser.isEmailVerified,
        isPhoneVerified: updatedUser.isPhoneVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

// Add email verification route
router.post(
  '/register/email',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array(), success: false });
        return;
      }

      const { email, password } = req.body;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({ 
          message: 'Email already in use',
          success: false 
        });
        return;
      }

      // Generate salt & hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const verificationToken = generateVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

      // Create user with verification token
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          isEmailVerified: false,
          isPhoneVerified: false,
          verificationToken,
          tokenExpiry,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken);

      // Generate JWT token
      const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

      const response = {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || '',
          firstName: newUser.firstName || undefined,
          lastName: newUser.lastName || undefined,
          profileImageUrl: newUser.profile_image_url || undefined,
          isProfileComplete: Boolean(newUser.name && newUser.email),
          isEmailVerified: false,
          isPhoneVerified: false,
        },
        success: true,
        message: 'Registration successful. Please check your email to verify your account.'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error in email registration:", error);
      res.status(500).json({ 
        message: 'Server error: ' + (error instanceof Error ? error.message : String(error)),
        success: false 
      });
    }
  }
);

// Verify email endpoint
router.get('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).send('Invalid or missing verification token');
      return;
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        tokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      }
    });

    if (!user) {
      res.status(400).send('Invalid or expired verification token');
      return;
    }

    // Update user as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        tokenExpiry: null,
        updatedAt: new Date()
      }
    });

    // If you're using a frontend app, redirect to it
    if (process.env.FRONTEND_URL) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/verification-success`);
    } else {
      // Or send a success page
      res.send(`
        <html>
          <head>
            <title>Email Verified</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                text-align: center;
                padding-top: 50px;
                background-color: #f4f7f6;
              }
              .container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 0 auto;
                padding: 30px;
              }
              h1 { color: #4a5568; }
              .success-icon {
                color: #38a169;
                font-size: 64px;
                margin: 20px 0;
              }
              .btn {
                background-color: #4a67ff;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                text-decoration: none;
                display: inline-block;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✓</div>
              <h1>Email Verified Successfully!</h1>
              <p>Your email has been successfully verified. You can now log in to your account.</p>
              <a href="${process.env.FRONTEND_URL || '/'}" class="btn">Go to Login</a>
            </div>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send('Server error occurred during verification');
  }
});

// Resend verification email
router.post('/resend-verification', 
  [
    body('email').isEmail().withMessage('Valid email required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array(), success: false });
        return;
      }

      const { email } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Return success regardless to prevent user enumeration
        res.json({
          success: true,
          message: 'If your email is registered, a verification link will be sent'
        });
        return;
      }

      if (user.isEmailVerified) {
        res.json({
          success: true,
          message: 'Your email is already verified'
        });
        return;
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      // Update user with new token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          tokenExpiry,
          updatedAt: new Date()
        }
      });


      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken, user?.name ?? 'User');

      res.json({
        success: true,
        message: 'Verification email has been sent'
      });
    } catch (error) {
      console.error("Error resending verification:", error);
      res.status(500).json({
        message: 'Server error',
        success: false
      });
    }
  }
);




// router.post(
//   '/login',
//   [
//     body('email').isEmail().withMessage('Valid email required'),
//     body('password').notEmpty().withMessage('Password is required'),
//   ],
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         res.status(400).json({ errors: errors.array() });
//         return;
//       }

//       const { email, password } = req.body;
//       const user = await prisma.user.findUnique({ 
//         where: { email },
//         select: {
//           id: true,
//           email: true,
//           password: true,
//           name: true,
//           profile_image_url: true,
//           firstName: true,
//           lastName: true,
//           isEmailVerified: true,
//           isPhoneVerified: true,
//           phone: true,
//         }
//       });  
      
//       if (!user) {
//         res.status(400).json({ message: 'Invalid credentials' });
//         return;
//       }

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         res.status(400).json({ message: 'Invalid credentials' });
//         return;
//       }

//       // Check if email is verified
//       if (!user.isEmailVerified) {
//         res.status(403).json({ 
//           message: 'Please verify your email before logging in',
//           requiresVerification: true,
//           success: false
//         });
//         return;
//       }

//       const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

//       const response: AuthResponse = {
//         token,
//         user: {
//           id: user.id,
//           email: user.email,
//           name: user.name || '',
//           firstName: user.firstName || undefined,
//           lastName: user.lastName || undefined,
//           phone: user.phone || undefined,
//           profileImageUrl: user.profile_image_url || undefined,
//           isProfileComplete: Boolean(user.name && user.email),
//           isEmailVerified: user.isEmailVerified,
//           isPhoneVerified: user.isPhoneVerified,
//         },
//         success: true,
//       };

//       res.json(response);
//     } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   }
// );



export default router;