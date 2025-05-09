import  express,{ Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateUser } from "../middleware/authMiddleware";
import { dropUpload } from "../middleware/uploadMiddleware";
import { body, validationResult } from 'express-validator';
import notificationService from "../services/notificationService";

const router = express.Router();
const prisma = new PrismaClient();

// interface DropRequestBody {
//     type: string;
//     title: string;
//     content: string;
//     location: string;
//   }

// ✅ Create a new Drop (Digital or Postal)
// Update your create drop endpoint to set the isLocked flag
router.post('/',  [authenticateUser, dropUpload,
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

    const { type, title, location, friendIds } = req.body;
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
        console.log('Friend IDs:', friendIds);
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
        
        // Create sharing records for valid friends with isLocked=true
        await tx.sharedDrop.createMany({
          data: validFriendIds.map(friendId => ({
            dropId: newDrop.id,
            friendId,
            isLocked: true, // Start locked by default
          })),
        });
        
        // Get user info for notifications
        const currentUser = await tx.user.findUnique({
          where: { id: req.user?.userId! },
          select: { name: true, firstName: true, profile_image_url: true }
        });
        
        const senderName = currentUser?.name || currentUser?.firstName || 'Someone';
        
        // Process each friend: create conversation, add message and send notification
        for (const friendId of validFriendIds) {
          // 1. Find existing conversation or create new one
          let conversation = await tx.conversation.findFirst({
            where: {
              AND: [
                { participants: { some: { userId: req.user?.userId! } } },
                { participants: { some: { userId: friendId } } }
              ]
            }
          });
          
          if (!conversation) {
            // Create a new conversation between the two users
            conversation = await tx.conversation.create({
              data: {
                name: null, // Direct message has no name
                // isGroup: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                participants: {
                  create: [
                    { userId: req.user?.userId! },
                    { userId: friendId }
                  ]
                }
              }
            });
          }
          
          // 2. Add message about the drop in the conversation
          await tx.message.create({
            data: {
              conversationId: conversation.id,
              senderId: req.user?.userId!,
              content: `I shared a Drop with you: "${title}"`,
              createdAt: new Date(),
              status: 'sent', // Add the required status field
              data: {
                dropId: newDrop.id,
                dropType: type,
                dropTitle: title,
              }
            }
          });
          
          // 3. Send notification to friend
          await tx.notification.create({
            data: {
              userId: friendId,
              title: `${senderName} shared a Drop with you`,
              body: `${title} - Find it nearby to unlock!`,
              type: 'dropShared',
              data: {
                dropId: newDrop.id,
                senderId: req.user?.userId!,
                dropType: type,
                isLocked: true
              }
            }
          });
        }
        
        // Send push notifications via Firebase (outside transaction to prevent rollback issues)
        setTimeout(async () => {
          try {
            for (const friendId of validFriendIds) {
              await notificationService.sendDropSharedNotification(
                newDrop.id,
                req.user?.userId!,
                friendId,
                title
              );
            }
          } catch (notifError) {
            console.error('Error sending notifications:', notifError);
          }
        }, 0);
      }
      
      return newDrop;
    });
    
    res.status(201).json(drop);
  } catch (error) {
    console.error('Error creating drop:', error);
    res.status(500).json({ message: 'Server error'+error });
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
// Modify your existing shared endpoint to respect lock status
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
    const formattedDrops = sharedDrops.map(shared => {
      // Check if the drop is locked
      const isLocked = shared.isLocked;
      
      return {
        id: shared.drop.id,
        title: shared.drop.title,
        description:  shared.drop.content, // Hide content if locked
        createdAt: shared.drop.createdAt.toISOString(),
        type: shared.drop.type.toLowerCase(),
        creatorId: shared.drop.userId,
        sharedWithUserIds: shared.drop.sharedWith.map(share => share.friend.id),
        imageUrl: shared.drop.content.startsWith('/uploads/') ? shared.drop.content : null, // Hide image if locked
        metadata: {
          location:  shared.drop.location, // Hide exact location if locked
          approximateLocation:  shared.drop.location , // Provide approximate location if locked
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
          isLocked: isLocked,
          unlockedAt: shared.unlockedAt?.toISOString() || null,
        },
      };
    });

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
  const { lat, lng } = req.body;

  try {
    // Require coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ message: 'Your location is required to unlock the drop.' });
      return;
    }

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
    const sharedDrop = drop.sharedWith.find(share => share.friendId === userId);

    if (!isOwner && !sharedDrop) {
      res.status(403).json({ message: 'Not authorized to unlock this drop' });
      return;
    }

    // If owner, always unlocked
    if (isOwner) {
      const formattedDrop = formatDrop(drop, false);
      res.json(formattedDrop);
      return;
    }

    // If already unlocked, return unlocked
    if (!sharedDrop?.isLocked) {
      const formattedDrop = formatDrop(drop, false);
      res.json(formattedDrop);
      return;
    }

    // Extract drop location
    const dropLocation = extractLocation(drop.location);
    if (!dropLocation) {
      res.status(400).json({ message: 'Invalid drop location format' });
      return;
    }
    const userLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const userLng = typeof lng === 'string' ? parseFloat(lng) : lng;
    const dropLat = dropLocation.lat;
    const dropLng = dropLocation.lng;
    const distance = calculateDistance(userLat, userLng, dropLat, dropLng);
    const unlockRadius = 0.1; // 100 meters

    if (distance > unlockRadius) {
      res.status(403).json({
        message: `You need to be within ${Math.round(unlockRadius * 1000)}m to unlock. You are ${Math.round(distance * 1000)}m away.`,
        isLocked: true,
        distance: Math.round(distance * 1000),
        requiredDistance: Math.round(unlockRadius * 1000)
      });
      return;
    }

    // Unlock for this user
    await prisma.sharedDrop.update({
      where: { id: sharedDrop.id },
      data: {
        isLocked: false,
        unlockedAt: new Date()
      }
    });

    // Send notification to drop creator
    try {
      const friendUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, firstName: true }
      });
      const friendName = friendUser?.name || friendUser?.firstName || 'Your friend';

      await notificationService.sendToUser(
        drop.userId,
        {
          title: 'Drop Unlocked!',
          body: `${friendName} unlocked your drop "${drop.title}"`,
          data: {
            dropId: drop.id,
            action: 'dropUnlocked'
          }
        },
        'dropUnlocked'
      );
    } catch (notifError) {
      console.error('Error sending unlock notification:', notifError);
      // Don't block unlock on notification failure
    }

    // Return unlocked drop
    const formattedDrop = formatDrop(drop, false);
    res.json(formattedDrop);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// router.get('/nearby', authenticateUser, async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Get query parameters
//     const lat = parseFloat(req.query.lat as string);
//     const lng = parseFloat(req.query.lng as string);
//     const radius = parseFloat(req.query.radius as string) || 5.0; // Default to 5km
    
//     // Validate parameters
//     if (isNaN(lat) || isNaN(lng)) {
//       res.status(400).json({ message: 'Invalid latitude or longitude' });
//       return;
//     }

//     // Get the current user's ID
//     const userId = req.user?.userId;
    
//     // Find drops within the specified radius
//     const allDrops = await prisma.drop.findMany({
//       where: {
//         OR: [
//           // User's own drops
//           { userId: userId },
          
//           // Drops shared with the user
//           {
//             sharedWith: {
//               some: {
//                 friendId: userId
//               }
//             }
//           }
//         ]
//       },
//       include: {
//         sharedWith: {
//           include: {
//             friend: {
//               select: {
//                 id: true,
//                 name: true,
//                 profile_image_url: true,
//               },
//             },
//           },
//         },
//         user: {
//           select: {
//             id: true,
//             name: true,
//             profile_image_url: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });
    
//     // Filter drops by distance
//     const nearbyDrops = allDrops.filter(drop => {
//       try {
//         // Parse location from JSON
//         const location = drop.location;
//         if (!location || !Array.isArray(location) || location.length < 2) {
//           return false;
//         }
        
//         const dropLat = typeof location[0] === 'string' ? parseFloat(location[0]) : Number(location[0]);
//         const dropLng = typeof location[1] === 'string' ? parseFloat(location[1]) : Number(location[1]);
        
//         if (isNaN(dropLat) || isNaN(dropLng)) {
//           return false;
//         }
        
//         // Calculate distance using the Haversine formula
//         const distance = calculateDistance(lat, lng, dropLat, dropLng);
        
//         return distance <= radius;
//       } catch (e) {
//         console.error('Error processing drop location:', e);
//         return false;
//       }
//     });
    
//     // Get all share statuses for this user to check if drops are locked
//     const sharedWithUser = await prisma.sharedDrop.findMany({
//       where: {
//         friendId: userId,
//         dropId: {
//           in: allDrops.map(drop => drop.id)
//         }
//       }
//     });

//     // Format the response to match Flutter Drop model
//     const formattedDrops = allDrops.map(drop => {
//       // Determine if this drop is locked for the current user
//       let isLocked = false;
      
//       // If user is not the creator, check if the drop is locked
//       if (drop.userId !== userId) {
//         // Find the shared drop record for this user
//         const sharedDrop = sharedWithUser.find(share => share.dropId === drop.id);
        
//         // Drop is locked if it was shared with the user and it's still locked
//         isLocked = sharedDrop ? !!sharedDrop.isLocked : false;
//       }
      
//       return {
//         id: drop.id,
//         title: drop.title,
//         description: isLocked ? null : drop.content, // Hide content if locked
//         createdAt: drop.createdAt.toISOString(),
//         type: drop.type.toLowerCase(),
//         creatorId: drop.userId,
//         sharedWithUserIds: drop.sharedWith.map(share => share.friend.id),
//         imageUrl: !isLocked && drop.content.startsWith('/uploads/') ? drop.content : null,
//         metadata: {
//           location: isLocked ? generateApproximateLocation(drop.location) : drop.location,
//           exactLocation: drop.location, // Always include for distance calculation
//           creator: {
//             id: drop.user.id,
//             name: drop.user.name,
//             profile_image_url: drop.user.profile_image_url,
//           },
//           sharedWith: drop.sharedWith.map(share => ({
//             id: share.friend.id,
//             name: share.friend.name,
//             profile_image_url: share.friend.profile_image_url,
//             sharedAt: share.createdAt,
//           })),
//           isLocked: isLocked && drop.userId !== userId,
//           isOwner: drop.userId === userId
//         },
//       };
//     });
    
//     res.json(formattedDrops);
//   } catch (error) {
//     console.error('Error fetching nearby drops:', error);
//     res.status(500).json({ message: 'Server error '+error });
//   }
// });

// ✅ Get all drops (explore: mine, shared, and others)
router.get('/nearby', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Only fetch drops that are owned by the user or shared with them
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
        sharedWith: true,
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

    // Fetch all sharedDrop records for this user
    const myShared = await prisma.sharedDrop.findMany({
      where: {
        friendId: userId,
        dropId: { in: allDrops.map(d => d.id) }
      }
    });
    
    // Format drops according to your rules
    const formattedDrops = allDrops.map(drop => {
      // 1. If mine, unlocked
      if (drop.userId === userId) {
        return {
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
              id: drop.user.id,
              name: drop.user.name,
              profile_image_url: drop.user.profile_image_url,
            },
            sharedWith: drop.sharedWith.map(share => ({
              id: share.friendId,
              sharedAt: share.createdAt,
            })),
            isUnlocked: true,
            isLocked: false,
            isOwner: true
          },
        };
      }
      // 2. If shared with me
      const shared = myShared.find(s => s.dropId === drop.id);
      if (shared) {
        console.log('Shared with me:', shared.id, shared.isLocked, shared.dropId, shared.friendId, userId);
        return {
          id: drop.id,
          title: drop.title,
          description:drop.content,
          createdAt: drop.createdAt.toISOString(),
          type: drop.type.toLowerCase(),
          creatorId: drop.userId,
          sharedWithUserIds: drop.sharedWith.map(share => share.friendId),
          imageUrl: (drop.content.startsWith('/uploads/') ? drop.content : null),
          metadata: {
            location:drop.location,
            creator: {
              id: drop.user.id,
              name: drop.user.name,
              profile_image_url: drop.user.profile_image_url,
            },
            sharedWith: drop.sharedWith.map(share => ({
              id: share.friendId,
              sharedAt: share.createdAt,
            })),
            isUnlocked: !shared.isLocked,
            isLocked: shared.isLocked,
            isOwner: false
          },
        };
      }

      // This shouldn't happen with the updated query, but included for safety
      return null;
    }).filter(drop => drop !== null);

    res.json(formattedDrops);
  } catch (error) {
    console.error('Error fetching all drops:', error);
    res.status(500).json({ message: 'Server error ' + error });
  }
});

// Helper function to generate an approximate location (removes precision)
// function generateApproximateLocation(location: any): any {
//   try {
//     if (Array.isArray(location) && location.length >= 2) {
//       const lat = typeof location[0] === 'string' ? parseFloat(location[0]) : location[0];
//       const lng = typeof location[1] === 'string' ? parseFloat(location[1]) : location[1];
      
//       // Round to fewer decimal places to reduce precision (roughly ~100m)
//       const roundedLat = Math.round(lat * 100) / 100;
//       const roundedLng = Math.round(lng * 100) / 100;
      
//       return [roundedLat, roundedLng];
//     } else if (typeof location === 'object' && location !== null) {
//       const lat = location.lat || location.latitude;
//       const lng = location.lng || location.longitude;
      
//       if (typeof lat === 'number' && typeof lng === 'number') {
//         return {
//           ...(location.lat !== undefined ? { lat: Math.round(lat * 100) / 100 } : {}),
//           ...(location.latitude !== undefined ? { latitude: Math.round(lat * 100) / 100 } : {}),
//           ...(location.lng !== undefined ? { lng: Math.round(lng * 100) / 100 } : {}),
//           ...(location.longitude !== undefined ? { longitude: Math.round(lng * 100) / 100 } : {})
//         };
//       }
//     }
//     return location;
//   } catch (e) {
//     console.error('Error generating approximate location:', e);
//     return null;
//   }
// }
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
// Check if a drop can be unlocked based on proximity
router.post('/:id/check-unlock', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const dropId = req.params.id;
    const userId = req.user?.userId;
    
    // Get the user's current location
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      res.status(400).json({ message: 'Current location is required' });
      return;
    }

    // Get the SharedDrop record
    const sharedDrop = await prisma.sharedDrop.findFirst({
      where: {
        dropId,
        friendId: userId,
      },
      include: {
        drop: true,
      },
    });

    if (!sharedDrop) {
      res.status(404).json({ message: 'Drop not found or not shared with you' });
      return;
    }

    // If already unlocked, return success
    if (!sharedDrop.isLocked) {
      res.json({
        isLocked: false,
        message: 'This drop is already unlocked',
        drop: formatDrop(sharedDrop.drop, false)
      });
      return;
    }

    // Update last checked time
    await prisma.sharedDrop.update({
      where: { id: sharedDrop.id },
      data: { lastChecked: new Date() }
    });

    // Get drop location
    const dropLocation = extractLocation(sharedDrop.drop.location);
    if (!dropLocation) {
      res.status(400).json({ message: 'Invalid drop location format' });
      return;
    }

    // Calculate distance
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const dropLat = dropLocation.lat;
    const dropLng = dropLocation.lng;
    const distance = calculateDistance(userLat, userLng, dropLat, dropLng);
    
    // Define the unlock radius (in kilometers)
    const unlockRadius = 0.1; // 100 meters
    
    if (distance <= unlockRadius) {
      // Close enough to unlock
      await prisma.sharedDrop.update({
        where: { id: sharedDrop.id },
        data: {
          isLocked: false,
          unlockedAt: new Date()
        }
      });
      
      // Get the updated drop
      const updatedDrop = await prisma.drop.findUnique({
        where: { id: dropId },
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
      });
      
      if (!updatedDrop) {
        res.status(404).json({ message: 'Drop not found' });
        return;
      }
      
      res.json({
        isLocked: false,
        message: 'Drop unlocked successfully!',
        drop: formatDrop(updatedDrop, false)
      });
    } else {
      // Too far away
      res.json({
        isLocked: true,
        distance: Math.round(distance * 1000), // Convert to meters for user-friendly display
        requiredDistance: Math.round(unlockRadius * 1000),
        message: `You need to be within ${Math.round(unlockRadius * 1000)}m of this drop to unlock it. Currently ${Math.round(distance * 1000)}m away.`
      });
    }
  } catch (error) {
    console.error('Error checking drop unlock status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to extract lat/lng from location data
function extractLocation(location: any): { lat: number; lng: number } | null {
  try {
    // Handle various location formats
    if (Array.isArray(location) && location.length >= 2) {
      const lat = typeof location[0] === 'string' ? parseFloat(location[0]) : location[0];
      const lng = typeof location[1] === 'string' ? parseFloat(location[1]) : location[1];
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    } else if (typeof location === 'object') {
      // Try to extract from object format
      const lat = location.lat || location.latitude;
      const lng = location.lng || location.longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { lat, lng };
      }
    }
    return null;
  } catch (e) {
    console.error('Error extracting location:', e);
    return null;
  }
}

// Helper function to format a drop response
// Define types for formatDrop function
// type SharedWithItem = {
//   friend?: {
//     id: string;
//     name: string;
//     profile_image_url: string | null;
//   };
//   createdAt: Date;
// };
// Get drop by id
router.get('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const dropId = req.params.id;
    const userId = req.user?.userId;
    
    // Find the drop with all necessary details
    const drop = await prisma.drop.findUnique({
      where: { id: dropId },
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
      }
    });
    
    // If drop doesn't exist, return 404
    if (!drop) {
      res.status(404).json({ message: 'Drop not found' });
      return;
    }
    
    // Check authorization:
    // - User must be either the owner of the drop
    // - Or a friend who the drop was shared with
    const isOwner = drop.userId === userId;
    const isSharedWithUser = drop.sharedWith.some(share => share.friendId === userId);
    
    if (!isOwner && !isSharedWithUser) {
      res.status(403).json({ message: 'Not authorized to view this drop' });
      return;
    }
    
    // If user is not the owner, check if the drop is locked
    let isLocked = false;
    
    if (!isOwner) {
      const sharedDrop = drop.sharedWith.find(share => share.friendId === userId);
      isLocked = sharedDrop ? !!sharedDrop.isLocked : false;
    }
    
    // Format the drop response
    const formattedDrop = formatDrop(drop, isLocked);
    
    res.json(formattedDrop);
  } catch (error) {
    console.error('Error fetching drop by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
function formatDrop(drop: any, _isLocked: boolean, userId?: string) {
  // Determine ownership and sharing
  const isOwner = drop.userId === userId;
  // Find sharedDrop for this user if available
  const sharedDrop = Array.isArray(drop.sharedWith)
    ? drop.sharedWith.find((share: any) => share.friendId === userId)
    : undefined;

  // Compute isUnlocked and isLocked for shared drops
  let isUnlocked = true;
  let isLockedFinal = false;
  if (!isOwner && sharedDrop) {
    isUnlocked = !sharedDrop.isLocked;
    isLockedFinal = sharedDrop.isLocked;
  } else if (!isOwner && !sharedDrop) {
    isUnlocked = false;
    isLockedFinal = true;
  }

  return {
    id: drop.id,
    title: drop.title,
    description: (isOwner || isUnlocked) ? drop.content : null,
    createdAt: drop.createdAt.toISOString(),
    type: drop.type.toLowerCase(),
    creatorId: drop.userId,
    sharedWithUserIds: drop.sharedWith?.map((share: any) => share.friend?.id || share.friendId) || [],
    imageUrl: (isOwner || isUnlocked) && drop.content.startsWith('/uploads/') ? drop.content : null,
    metadata: {
      location: (isOwner || isUnlocked) ? drop.location : null,
      creator: drop.user ? {
        id: drop.user.id,
        name: drop.user.name,
        profile_image_url: drop.user.profile_image_url,
      } : null,
      sharedWith: drop.sharedWith?.map((share: any) => ({
        id: share.friend?.id || share.friendId,
        name: share.friend?.name,
        profile_image_url: share.friend?.profile_image_url,
        sharedAt: share.createdAt,
      })) || [],
      isUnlocked: isOwner ? true : isUnlocked,
      isLocked: isOwner ? false : isLockedFinal,
      isOwner: isOwner
    },
  };
}
export default router;
