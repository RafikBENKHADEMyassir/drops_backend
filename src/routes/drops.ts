import  express,{ Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateUser } from "../middleware/authMiddleware";
import { dropUpload } from "../middleware/uploadMiddleware";
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// interface DropRequestBody {
//     type: string;
//     title: string;
//     content: string;
//     location: string;
//   }

// ✅ Create a new Drop (Digital or Postal)
router.post('/',  [authenticateUser,dropUpload,
  body('type').notEmpty().withMessage('Type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('location').notEmpty().withMessage('Location is required'),
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('data received:', req.body);
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { type, title, location,friendIds } = req.body;
    let locationData;
    try {
      locationData = typeof location === 'string' 
        ? JSON.parse(location) 
        : location;
    } catch (e) {
      res.status(400).json({ message: 'Invalid location format' });
      return;
    }
    // Handle the content field (file or text)
    let content = req.body.content;
    const contentFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.['content']?.[0];
    if (contentFile) {
      content = `/uploads/${contentFile.filename}`;
    } else if (typeof content === 'string') {
      content = content;
    } else {
      res.status(400).json({ message: 'Content is required' });
      return;
    }
    const drop = await prisma.$transaction(async (tx) => {

      const newDrop = await tx.drop.create({
        data: {
          type,
          title,
          content,
          location: locationData,
          userId: req.user?.userId!,
        },
      });
      if (friendIds) {
        const sharedWithIds = Array.isArray(friendIds) 
          ? friendIds 
          : JSON.parse(friendIds);

        // Verify these are actually friends
        const friends = await tx.friend.findMany({
          where: {
            userId: req.user?.userId,
            friendId: { in: sharedWithIds },
          },
        });

        const validFriendIds = friends.map(f => f.friendId);
        // Create sharing records for valid friends
        await tx.sharedDrop.createMany({
          data: validFriendIds.map(friendId => ({
            dropId: newDrop.id,
            friendId,
          })),
        });
      }
      return newDrop;
    });
    res.status(201).json(drop);
  } catch (error) {
    console.error('Error creating drop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all Drops (for testing or admin purposes)
router.get("/", authenticateUser, async (req, res) => {
  try {
    const drops = await prisma.drop.findMany({
      where: { userId: req.user?.userId },
    });
    res.json(drops);
  } catch (error) {
    console.error("Error fetching drops:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// router.post("/upload", authenticateUser, upload.single("file"), async (req, res): Promise<void> => {
//     if (!req.file) {
//       res.status(400).json({ message: "No file uploaded" });
//       return;
//     }
  
//     // ✅ File uploaded successfully
//     const fileUrl = `/uploads/${req.file.filename}`;
//     res.status(201).json({ fileUrl });
//   });
  
// Add endpoint to get drops shared with me
router.get('/shared', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const sharedDrops = await prisma.sharedDrop.findMany({
      where: {
        friendId: req.user?.userId,
      },
      include: {
        drop: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_image_url: true,
              },
            },
            sharedWith: {
              include: {
                friend: {
                  select: {
                    id: true,
                    name: true,
                    profile_image_url: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to match Flutter Drop model
    const formattedDrops = sharedDrops.map(shared => ({
      id: shared.drop.id,
      title: shared.drop.title,
      description: shared.drop.content,
      createdAt: shared.drop.createdAt.toISOString(),
      type: shared.drop.type.toLowerCase(),
      creatorId: shared.drop.userId,
      sharedWithUserIds: shared.drop.sharedWith.map(share => share.friend.id),
      imageUrl: shared.drop.content.startsWith('/uploads/') ? shared.drop.content : null,
      metadata: {
        location: shared.drop.location,
        creator: {
          name: shared.drop.user.name,
          profile_image_url: shared.drop.user.profile_image_url,
        },
        sharedWith: shared.drop.sharedWith.map(share => ({
          id: share.friend.id,
          name: share.friend.name,
          profile_image_url: share.friend.profile_image_url,
          sharedAt: share.createdAt,
        })),
      },
    }));

    res.json(formattedDrops);
  } catch (error) {
    console.error('Error fetching shared drops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get my drops with sharing details
router.get('/mine', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const myDrops = await prisma.drop.findMany({
      where: {
        userId: req.user?.userId,
      },
      include: {
        sharedWith: {
          include: {
            friend: {
              select: {
                id: true,
                name: true,
                profile_image_url: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            profile_image_url: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to match Flutter Drop model
    const formattedDrops = myDrops.map(drop => ({
      id: drop.id,
      title: drop.title,
      description: drop.content, // Using content as description
      createdAt: drop.createdAt.toISOString(),
      type: drop.type.toLowerCase(), // Ensure it matches DropType enum
      creatorId: drop.userId,
      sharedWithUserIds: drop.sharedWith.map(share => share.friend.id),
      imageUrl: drop.content.startsWith('/uploads/') ? drop.content : null, // If content is a file path, use it as imageUrl
      metadata: {
        location: drop.location,
        creator: {
          name: drop.user.name,
          profile_image_url: drop.user.profile_image_url,
        },
        sharedWith: drop.sharedWith.map(share => ({
          id: share.friend.id,
          name: share.friend.name,
          profile_image_url: share.friend.profile_image_url,
          sharedAt: share.createdAt,
        })),
      },
    }));

    res.json(formattedDrops);
  } catch (error) {
    console.error('Error fetching my drops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
