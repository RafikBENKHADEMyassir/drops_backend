import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default class ChatService {
  // Get all conversations for a user
  async getConversations(userId: string) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  name: true,
                  profile_image_url: true,
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  name: true,
                }
              },
              readBy: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return conversations.map(conversation => {
        // Calculate unread messages count for this user
        const unreadCount = conversation.messages.filter(message => {
          return message.senderId !== userId && 
                 !message.readBy.some(read => read.userId === userId);
        }).length;

        return {
          id: conversation.id,
          name: conversation.name,
          participants: conversation.participants.map(participant => ({
            id: participant.user.id,
            displayName: participant.user.name || 
                        `${participant.user.firstName || ''} ${participant.user.lastName || ''}`.trim(),
            avatarUrl: participant.user.profile_image_url,
            isAdmin: participant.isAdmin
          })),
          lastMessage: conversation.messages.length > 0 ? {
            id: conversation.messages[0].id,
            content: conversation.messages[0].content,
            senderId: conversation.messages[0].senderId,
            senderName: conversation.messages[0].sender.name || 
                        `${conversation.messages[0].sender.firstName || ''} ${conversation.messages[0].sender.lastName || ''}`.trim(),
            timestamp: conversation.messages[0].createdAt,
            status: conversation.messages[0].status
          } : null,
          unreadCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        };
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  // Get a specific conversation by ID
  async getConversationById(conversationId: string, userId: string) {
    try {
      // Check if the user is a participant
      const participant = await prisma.participant.findUnique({
        where: {
          userId_conversationId: {
            userId,
            conversationId
          }
        }
      });

      if (!participant) {
        throw new Error('You are not a member of this conversation');
      }

      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  name: true,
                  profile_image_url: true,
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  name: true,
                }
              },
              readBy: true
            }
          }
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Format the response
      return {
        id: conversation.id,
        name: conversation.name,
        participants: conversation.participants.map(participant => ({
          id: participant.user.id,
          displayName: participant.user.name || 
                      `${participant.user.firstName || ''} ${participant.user.lastName || ''}`.trim(),
          avatarUrl: participant.user.profile_image_url,
          isAdmin: participant.isAdmin
        })),
        lastMessage: conversation.messages.length > 0 ? {
          id: conversation.messages[0].id,
          content: conversation.messages[0].content,
          senderId: conversation.messages[0].senderId,
          senderName: conversation.messages[0].sender.name || 
                     `${conversation.messages[0].sender.firstName || ''} ${conversation.messages[0].sender.lastName || ''}`.trim(),
          timestamp: conversation.messages[0].createdAt,
          status: conversation.messages[0].status
        } : null,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, userId: string, limit: number = 20, beforeId?: string) {
    try {
      // Check if the user is a participant
      const participant = await prisma.participant.findUnique({
        where: {
          userId_conversationId: {
            userId,
            conversationId
          }
        }
      });

      if (!participant) {
        throw new Error('You are not a member of this conversation');
      }

      // Build the query
      const whereClause: any = {
        conversationId,
      };

      if (beforeId) {
        const beforeMessage = await prisma.message.findUnique({
          where: { id: beforeId },
          select: { createdAt: true }
        });

        if (beforeMessage) {
          whereClause.createdAt = {
            lt: beforeMessage.createdAt
          };
        }
      }

      const messages = await prisma.message.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              profile_image_url: true,
            }
          },
          readBy: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      // Mark messages as read
      const messagesToMark = messages.filter(
        msg => msg.senderId !== userId && !msg.readBy.some(read => read.userId === userId)
      );

      if (messagesToMark.length > 0) {
        await Promise.all(
          messagesToMark.map(msg =>
            prisma.messageRead.create({
              data: {
                messageId: msg.id,
                userId
              }
            })
          )
        );
      }

      // Format the response
      return messages.map(message => ({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender.name || 
                   `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim(),
        senderAvatar: message.sender.profile_image_url,
        content: message.content,
        data: message.data ? (typeof message.data === 'object' ? message.data : JSON.parse(message.data as any)) : null,
        attachmentUrl: message.attachmentUrl,
        attachmentType: message.attachmentType,
        status: message.status,
        isDeleted: message.isDeleted,
        timestamp: message.createdAt,
        readBy: message.readBy.map(read => ({
          userId: read.userId,
          readAt: read.readAt
        }))
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a new message
  async sendMessage(conversationId: string, senderId: string, content: string, attachment?: { url: string, type: string }) {
    try {
      // Check if the user is a participant
      const participant = await prisma.participant.findUnique({
        where: {
          userId_conversationId: {
            userId: senderId,
            conversationId
          }
        }
      });

      if (!participant) {
        throw new Error('You are not a member of this conversation');
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          id: uuidv4(),
          conversationId,
          senderId,
          content,
          attachmentUrl: attachment?.url,
          attachmentType: attachment?.type,
          status: 'sent'
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              profile_image_url: true,
            }
          }
        }
      });

      // Update conversation's updatedAt timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      // Format the response
      return {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender.name || 
                   `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim(),
        senderAvatar: message.sender.profile_image_url,
        content: message.content,
        attachmentUrl: message.attachmentUrl,
        attachmentType: message.attachmentType,
        status: message.status,
        isDeleted: message.isDeleted,
        timestamp: message.createdAt,
        readBy: []
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(creatorId: string, participantIds: string[], name?: string) {
    try {
      // Ensure the creator is included in participants
      if (!participantIds.includes(creatorId)) {
        participantIds.push(creatorId);
      }

      // Check if all participants exist
      const users = await prisma.user.findMany({
        where: {
          id: { in: participantIds }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          profile_image_url: true
        }
      });

      if (users.length !== participantIds.length) {
        throw new Error('One or more participants do not exist');
      }

      // For one-on-one conversations, check if a conversation already exists
      if (participantIds.length === 2 && !name) {
        const existingConversation = await prisma.conversation.findFirst({
            where: {
              AND: [
                {
                  participants: {
                    some: {
                      userId: participantIds[0]
                    }
                  }
                },
                {
                  participants: {
                    some: {
                      userId: participantIds[1]
                    }
                  }
                },
                {
                  participants: {
                    every: {
                      userId: {
                        in: participantIds
                      }
                    }
                  }
                },
                {
                  // Use a separate subquery to count participants
                  id: {
                    in: await prisma.conversation.findMany({
                      where: {
                        participants: {
                          every: {
                            userId: {
                              in: participantIds
                            }
                          }
                        }
                      },
                      select: {
                        id: true,
                        _count: {
                          select: { participants: true }
                        }
                      }
                    }).then(conversations => 
                      conversations
                        .filter(conv => conv._count.participants === 2)
                        .map(conv => conv.id)
                    )
                  }
                }
              ]
            },
            include: {
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      name: true,
                      profile_image_url: true,
                    }
                  }
                }
              },
              messages: {
                orderBy: {
                  createdAt: 'desc'
                },
                take: 1,
                include: {
                  sender: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      name: true,
                    }
                  },
                  readBy: true
                }
              }
            }
          });
          

        if (existingConversation) {
          // Return the existing conversation
          return {
            id: existingConversation.id,
            name: existingConversation.name,
            participants: existingConversation.participants.map(participant => ({
              id: participant.user.id,
              displayName: participant.user.name || 
                          `${participant.user.firstName || ''} ${participant.user.lastName || ''}`.trim(),
              avatarUrl: participant.user.profile_image_url,
              isAdmin: participant.isAdmin
            })),
            lastMessage: existingConversation.messages.length > 0 ? {
              id: existingConversation.messages[0].id,
              content: existingConversation.messages[0].content,
              senderId: existingConversation.messages[0].senderId,
              senderName: existingConversation.messages[0].sender.name || 
                         `${existingConversation.messages[0].sender.firstName || ''} ${existingConversation.messages[0].sender.lastName || ''}`.trim(),
              timestamp: existingConversation.messages[0].createdAt,
              status: existingConversation.messages[0].status
            } : null,
            createdAt: existingConversation.createdAt,
            updatedAt: existingConversation.updatedAt
          };
        }
      }

      // Create a new conversation
      const conversation = await prisma.conversation.create({
        data: {
          id: uuidv4(),
          name,
          participants: {
            create: participantIds.map(userId => ({
              userId,
              isAdmin: userId === creatorId // Only the creator is admin
            }))
          }
        }
      });

      // Fetch the created conversation with participants
      const createdConversation = await prisma.conversation.findUnique({
        where: {
          id: conversation.id
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  name: true,
                  profile_image_url: true,
                }
              }
            }
          }
        }
      });

      if (!createdConversation) {
        throw new Error('Failed to create conversation');
      }

      // Format the response
      return {
        id: createdConversation.id,
        name: createdConversation.name,
        participants: createdConversation.participants.map(participant => ({
          id: participant.user.id,
          displayName: participant.user.name || 
                      `${participant.user.firstName || ''} ${participant.user.lastName || ''}`.trim(),
          avatarUrl: participant.user.profile_image_url,
          isAdmin: participant.isAdmin
        })),
        lastMessage: null,
        createdAt: createdConversation.createdAt,
        updatedAt: createdConversation.updatedAt
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string, messageIds: string[]) {
    try {
      // Check if the user is a participant
      const participant = await prisma.participant.findUnique({
        where: {
          userId_conversationId: {
            userId,
            conversationId
          }
        }
      });

      if (!participant) {
        throw new Error('You are not a member of this conversation');
      }

      // Mark messages as read
      await Promise.all(
        messageIds.map(messageId =>
          prisma.messageRead.upsert({
            where: {
              messageId_userId: {
                messageId,
                userId
              }
            },
            update: {},
            create: {
              messageId,
              userId
            }
          })
        )
      );

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Leave a conversation
  async leaveConversation(conversationId: string, userId: string) {
    try {
      // Check if the user is a participant
      const participant = await prisma.participant.findUnique({
        where: {
          userId_conversationId: {
            userId,
            conversationId
          }
        }
      });

      if (!participant) {
        throw new Error('You are not a member of this conversation');
      }

      // Delete the participant
      await prisma.participant.delete({
        where: {
          userId_conversationId: {
            userId,
            conversationId
          }
        }
      });

      // Check if there are any participants left
      const remainingParticipants = await prisma.participant.count({
        where: {
          conversationId
        }
      });

      // If no participants left, delete the conversation
      if (remainingParticipants === 0) {
        await prisma.conversation.delete({
          where: {
            id: conversationId
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error leaving conversation:', error);
      throw error;
    }
  }

  // Delete a message
  async deleteMessage(messageId: string, userId: string, forEveryone: boolean = false) {
    try {
      // Get the message
      const message = await prisma.message.findUnique({
        where: {
          id: messageId
        },
        include: {
          conversation: {
            include: {
              participants: true
            }
          }
        }
      });

      if (!message) {
        throw new Error('Message not found');
      }

      // Check if the user is the sender
      if (forEveryone && message.senderId !== userId) {
        throw new Error('You can only delete your own messages for everyone');
      }

      // Check if the user is a participant
      const isParticipant = message.conversation.participants.some(p => p.userId === userId);
      if (!isParticipant) {
        throw new Error('You are not a member of this conversation');
      }

      if (forEveryone) {
        // Update the message to mark it as deleted
        await prisma.message.update({
          where: {
            id: messageId
          },
          data: {
            isDeleted: true
          }
        });
      } else {
        // For "delete for me", we just remove the message from the user's view
        // This could be implemented differently based on your requirements
        await prisma.messageRead.create({
          data: {
            messageId,
            userId,
            // You could add a special field in your schema to mark messages as "deleted for me"
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}