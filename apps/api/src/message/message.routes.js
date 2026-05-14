import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { io } from "../server.js";
import multer from "multer";
const getMessageReactions = async (messageId, currentUserId) => {
    const reactions = await prisma.messageReaction.findMany({
        where: {
            messageId,
        },
        select: {
            emoji: true,
            userId: true,
        },
    });
    const reactionMap = new Map();
    reactions.forEach((reaction) => {
        const current = reactionMap.get(reaction.emoji);
        reactionMap.set(reaction.emoji, {
            count: current ? current.count + 1 : 1,
            reacted: current?.reacted || reaction.userId === currentUserId || false,
        });
    });
    return Array.from(reactionMap.entries()).map(([emoji, data]) => ({
        emoji,
        count: data.count,
        reacted: data.reacted,
    }));
};
const router = Router();
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { content, channelId } = req.body;
        if (!content || !channelId) {
            return res.status(400).json({
                message: "content and channelId are required",
            });
        }
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
        });
        if (!channel) {
            return res.status(404).json({
                message: "Channel not found",
            });
        }
        const member = await prisma.serverMember.findUnique({
            where: {
                userId_serverId: {
                    userId: req.user.userId,
                    serverId: channel.serverId,
                },
            },
        });
        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this server",
            });
        }
        const message = await prisma.message.create({
            data: {
                content,
                userId: req.user.userId,
                channelId,
                conversationId: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        io.to(channelId).emit("message:new", message);
        return res.status(201).json(message);
    }
    catch (error) {
        console.error("Send channel message error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
/**
 * GET CHANNEL MESSAGES
 * GET /messages/channel/:channelId
 */
router.get("/channel/:channelId", authMiddleware, async (req, res) => {
    try {
        const channelId = req.params.channelId;
        if (typeof channelId !== "string") {
            return res.status(400).json({
                message: "channelId is required",
            });
        }
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
        });
        if (!channel) {
            return res.status(404).json({
                message: "Channel not found",
            });
        }
        const member = await prisma.serverMember.findUnique({
            where: {
                userId_serverId: {
                    userId: req.user.userId,
                    serverId: channel.serverId,
                },
            },
        });
        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this server",
            });
        }
        const messages = await prisma.message.findMany({
            where: {
                channelId,
                conversationId: null,
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                reactions: {
                    select: {
                        emoji: true,
                        userId: true,
                    },
                },
            },
        });
        const formattedMessages = messages.map((message) => {
            const reactionMap = new Map();
            message.reactions.forEach((reaction) => {
                const current = reactionMap.get(reaction.emoji);
                reactionMap.set(reaction.emoji, {
                    count: current ? current.count + 1 : 1,
                    reacted: current?.reacted || reaction.userId === req.user.userId || false,
                });
            });
            return {
                ...message,
                reactions: Array.from(reactionMap.entries()).map(([emoji, data]) => ({
                    emoji,
                    count: data.count,
                    reacted: data.reacted,
                })),
            };
        });
        return res.json(formattedMessages);
    }
    catch (error) {
        console.error("Get channel messages error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
/**
 * GET DM MESSAGES
 * GET /messages/conversation/:conversationId
 */
router.get("/conversation/:conversationId", authMiddleware, async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        if (typeof conversationId !== "string") {
            return res.status(400).json({
                message: "conversationId is required",
            });
        }
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                users: {
                    some: {
                        id: req.user.userId,
                    },
                },
            },
        });
        if (!conversation) {
            return res.status(403).json({
                message: "You are not in this conversation",
            });
        }
        const messages = await prisma.message.findMany({
            where: {
                conversationId,
                channelId: null,
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                reactions: {
                    select: {
                        emoji: true,
                        userId: true,
                    },
                },
            },
        });
        const formattedMessages = messages.map((message) => {
            const reactionMap = new Map();
            message.reactions.forEach((reaction) => {
                const current = reactionMap.get(reaction.emoji);
                reactionMap.set(reaction.emoji, {
                    count: current ? current.count + 1 : 1,
                    reacted: current?.reacted || reaction.userId === req.user.userId || false,
                });
            });
            return {
                ...message,
                reactions: Array.from(reactionMap.entries()).map(([emoji, data]) => ({
                    emoji,
                    count: data.count,
                    reacted: data.reacted,
                })),
            };
        });
        return res.json(formattedMessages);
    }
    catch (error) {
        console.error("Get conversation messages error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
/**
 * SEND DM MESSAGE
 * POST /messages/dm
 */
router.post("/dm", authMiddleware, async (req, res) => {
    try {
        const { content, conversationId } = req.body;
        if (!content || !conversationId) {
            return res.status(400).json({
                message: "content and conversationId are required",
            });
        }
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                users: {
                    some: {
                        id: req.user.userId,
                    },
                },
            },
        });
        if (!conversation) {
            return res.status(403).json({
                message: "You are not in this conversation",
            });
        }
        const message = await prisma.message.create({
            data: {
                content,
                userId: req.user.userId,
                conversationId,
                channelId: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        io.to(conversationId).emit("message:new", message);
        return res.status(201).json(message);
    }
    catch (error) {
        console.error("Send DM error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.get("/search", authMiddleware, async (req, res) => {
    try {
        const q = String(req.query.q || "").trim();
        const channelId = req.query.channelId
            ? String(req.query.channelId)
            : undefined;
        const conversationId = req.query.conversationId
            ? String(req.query.conversationId)
            : undefined;
        if (!q) {
            return res.status(400).json({
                message: "q is required",
            });
        }
        if (!channelId && !conversationId) {
            return res.status(400).json({
                message: "channelId or conversationId is required",
            });
        }
        if (channelId) {
            const channel = await prisma.channel.findUnique({
                where: { id: channelId },
            });
            if (!channel) {
                return res.status(404).json({
                    message: "Channel not found",
                });
            }
            const member = await prisma.serverMember.findUnique({
                where: {
                    userId_serverId: {
                        userId: req.user.userId,
                        serverId: channel.serverId,
                    },
                },
            });
            if (!member) {
                return res.status(403).json({
                    message: "You are not a member of this server",
                });
            }
            const messages = await prisma.message.findMany({
                where: {
                    channelId,
                    conversationId: null,
                    content: {
                        contains: q,
                        mode: "insensitive",
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 30,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            return res.json(messages);
        }
        if (conversationId) {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    users: {
                        some: {
                            id: req.user.userId,
                        },
                    },
                },
            });
            if (!conversation) {
                return res.status(403).json({
                    message: "You are not in this conversation",
                });
            }
            const messages = await prisma.message.findMany({
                where: {
                    conversationId,
                    channelId: null,
                    content: {
                        contains: q,
                        mode: "insensitive",
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 30,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            return res.json(messages);
        }
    }
    catch (error) {
        console.error("Search messages error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.post("/:messageId/reactions", authMiddleware, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.userId;
        if (!emoji || typeof emoji !== "string") {
            return res.status(400).json({
                message: "emoji is required",
            });
        }
        const message = await prisma.message.findUnique({
            where: {
                id: messageId,
            },
        });
        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }
        const existingReaction = await prisma.messageReaction.findUnique({
            where: {
                userId_messageId_emoji: {
                    userId,
                    messageId,
                    emoji,
                },
            },
        });
        if (existingReaction) {
            await prisma.messageReaction.delete({
                where: {
                    id: existingReaction.id,
                },
            });
        }
        else {
            await prisma.messageReaction.create({
                data: {
                    userId,
                    messageId,
                    emoji,
                },
            });
        }
        const reactions = await getMessageReactions(messageId);
        const payload = {
            messageId,
            reactions,
        };
        if (message.channelId) {
            io.to(message.channelId).emit("message:reaction", payload);
        }
        if (message.conversationId) {
            io.to(message.conversationId).emit("message:reaction", payload);
        }
        return res.json(reactions);
    }
    catch (error) {
        console.error("Toggle reaction error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.patch("/:messageId", authMiddleware, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        if (!content?.trim()) {
            return res.status(400).json({
                message: "content is required",
            });
        }
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }
        if (message.userId !== req.user.userId) {
            return res.status(403).json({
                message: "You can only edit your own message",
            });
        }
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { content },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (updatedMessage.channelId) {
            io.to(updatedMessage.channelId).emit("message:updated", updatedMessage);
        }
        if (updatedMessage.conversationId) {
            io.to(updatedMessage.conversationId).emit("message:updated", updatedMessage);
        }
        return res.json(updatedMessage);
    }
    catch (error) {
        console.error("Edit message error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.delete("/:messageId", authMiddleware, async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }
        let canDelete = message.userId === req.user.userId;
        if (!canDelete && message.channelId) {
            const channel = await prisma.channel.findUnique({
                where: { id: message.channelId },
            });
            if (channel) {
                const member = await prisma.serverMember.findUnique({
                    where: {
                        userId_serverId: {
                            userId: req.user.userId,
                            serverId: channel.serverId,
                        },
                    },
                });
                canDelete = member?.role === "OWNER" || member?.role === "ADMIN";
            }
        }
        if (!canDelete) {
            return res.status(403).json({
                message: "You cannot delete this message",
            });
        }
        await prisma.message.delete({
            where: { id: messageId },
        });
        const payload = {
            id: messageId,
            channelId: message.channelId,
            conversationId: message.conversationId,
        };
        if (message.channelId) {
            io.to(message.channelId).emit("message:deleted", payload);
        }
        if (message.conversationId) {
            io.to(message.conversationId).emit("message:deleted", payload);
        }
        return res.json({
            message: "Message deleted",
            id: messageId,
        });
    }
    catch (error) {
        console.error("Delete message error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        const { content, channelId, conversationId } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "file is required" });
        }
        if (!channelId && !conversationId) {
            return res.status(400).json({
                message: "channelId or conversationId is required",
            });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        const message = await prisma.message.create({
            data: {
                content: content || "",
                userId: req.user.userId,
                channelId: channelId || null,
                conversationId: conversationId || null,
                fileUrl,
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (channelId) {
            io.to(channelId).emit("message:new", message);
        }
        if (conversationId) {
            io.to(conversationId).emit("message:new", message);
        }
        return res.status(201).json(message);
    }
    catch (error) {
        console.error("Upload message error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
export default router;
//# sourceMappingURL=message.routes.js.map