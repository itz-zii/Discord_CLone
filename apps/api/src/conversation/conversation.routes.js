import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUserId = req.user.userId;
        if (!userId) {
            return res.status(400).json({
                message: "userId is required",
            });
        }
        if (userId === currentUserId) {
            return res.status(400).json({
                message: "Cannot create DM with yourself",
            });
        }
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    {
                        users: {
                            some: {
                                id: currentUserId,
                            },
                        },
                    },
                    {
                        users: {
                            some: {
                                id: userId,
                            },
                        },
                    },
                ],
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (existingConversation) {
            return res.json(existingConversation);
        }
        const conversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [{ id: currentUserId }, { id: userId }],
                },
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        return res.status(201).json(conversation);
    }
    catch (error) {
        console.error("Create conversation error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.get("/", authMiddleware, async (req, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                users: {
                    some: {
                        id: req.user.userId,
                    },
                },
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return res.json(conversations);
    }
    catch (error) {
        console.error("Get conversations error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
export default router;
//# sourceMappingURL=conversation.routes.js.map