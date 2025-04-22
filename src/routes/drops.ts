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

router.post('/:id/unlock', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const dropId = req.params.id;
  const userId = req.user?.userId;
  
  try {
    // Find the drop
    const drop = await prisma.drop.findUnique({
      where: { id: dropId },
      include: {
        sharedWith: true,
        user: {
          select: {
            id: true,
            name: true,
            profile_image_url: true,
          },
        },
      }
    });
    
    if (!drop) {
      res.status(404).json({ message: 'Drop not found' });
      return;
    }
    
    // Check if the user is the owner or the drop is shared with them
    const isOwner = drop.userId === userId;
    const isSharedWithUser = drop.sharedWith.some(share => share.friendId === userId);
    
    if (!isOwner && !isSharedWithUser) {
      res.status(403).json({ message: 'Not authorized to unlock this drop' });
      return;
    }
    
    // Update the drop's metadata to mark it as unlocked for this user
    // Note: In a real implementation, you might want to track this in a separate table
    // that records which users have unlocked which drops
    
    // For now, we'll just return success
    // In a real implementation, you would update the database
    
    // Format the response to match Flutter Drop model
    const formattedDrop = {
      id: drop.id,
      title: drop.title,
      description: drop.content,
      createdAt: drop.createdAt.toISOString(),
      type: drop.type.toLowerCase(),
      creatorId: drop.userId,
      sharedWithUserIds: drop.sharedWith.map(share => share.friendId),
      imageUrl: drop.content.startsWith('/uploads/') ? drop.content : null,
      metadata: {
        location: drop.location,
        creator: {
          name: drop.user.name,
          profile_image_url: drop.user.profile_image_url,
        },
        sharedWith: drop.sharedWith.map(share => ({
          id: share.friendId,
          // You would need to join with User table to get these details
          name: 'User', // Placeholder
          profile_image_url: null, // Placeholder
          sharedAt: share.createdAt,
        })),
        isUnlocked: true, // Mark as unlocked
      },
    };
    
    res.json(formattedDrop);
  } catch (error) {
    console.error('Error unlocking drop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/nearby', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get query parameters
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 5.0; // Default to 5km
    
    // Validate parameters
    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ message: 'Invalid latitude or longitude' });
      return;
    }

    // Get the current user's ID
    const userId = req.user?.userId;
    
    // Find drops within the specified radius
    // For PostgreSQL with PostGIS extension, you could use ST_Distance
    // Here, we'll fetch all public drops and filter them in-memory (not efficient for production)
    const allDrops = await prisma.drop.findMany({
      where: {
        OR: [
          // User's own drops
          { userId: userId },
          
          // Drops shared with the user
          {
            sharedWith: {
              some: {
                friendId: userId
              }
            }
          }
        ]
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
    
    // Helper function to calculate distance between two coordinates using the Haversine formula
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in kilometers
      
      return distance;
    }
    
    // Filter drops by distance
    const nearbyDrops = allDrops.filter(drop => {
      try {
        // Parse location from JSON
        const location = drop.location;
        if (!location || !Array.isArray(location) || location.length < 2) {
          return false;
        }
        
        const dropLat = typeof location[0] === 'string' ? parseFloat(location[0]) : NaN;
        const dropLng = typeof location[1] === 'string' ? parseFloat(location[1]) : NaN;
        
        if (isNaN(dropLat) || isNaN(dropLng)) {
          return false;
        }
        
        // Calculate distance using the Haversine formula
        const distance = calculateDistance(lat, lng, dropLat, dropLng);
        
        return distance <= radius;
      } catch (e) {
        console.error('Error processing drop location:', e);
        return false;
      }
    });
    
    // Format the response to match Flutter Drop model
    const formattedDrops = nearbyDrops.map(drop => ({
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
          id: drop.user.id,
          name: drop.user.name,
          profile_image_url: drop.user.profile_image_url,
        },
        sharedWith: drop.sharedWith.map(share => ({
          id: share.friend.id,
          name: share.friend.name,
          profile_image_url: share.friend.profile_image_url,
          sharedAt: share.createdAt,
        })),
        // Set isUnlocked to false by default - users need to be at the location to unlock
        isUnlocked: false
      },
    }));
console.log('Nearby drops:', formattedDrops[0].metadata.location?.toString());
    res.json(formattedDrops);
  } catch (error) {
    console.error('Error fetching nearby drops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
