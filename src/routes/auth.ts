import express from 'express';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { authenticateUser } from "../middleware/authMiddleware";
import { handleProfileUpload } from '../middleware/profileUploadMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
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
        res.status(400).json({ errors: errors.array() });
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
 const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: '7m' });

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
      console.error("Error in email registration:", error);
      res.status(500).json({ 
        message: 'Server error'+error.message,
        success: false 
      });
    }
  }
);
  export default router;
