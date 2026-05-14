import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import crypto from "crypto";
const router = Router();
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, avatarUrl } = req.body;
        if (!name) {
            return res.status(400).json({
                message: "Server name is required",
            });
        }
        const server = await prisma.server.create({
            data: {
                name,
                avatarUrl: avatarUrl || null,
                ownerId: req.user.userId,
                members: {
                    create: {
                        userId: req.user.userId,
                        role: "OWNER",
                    },
                },
                channels: {
                    create: [
                        {
                            name: "general",
                        },
                        {
                            name: "General Voice",
                        },
                    ],
                },
            },
            include: {
                members: true,
            },
        });
        console.log("Server created:", server);
        return res.status(201).json(server);
    }
    catch (error) {
        console.error("Create server error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
router.post("/:serverId/join", authMiddleware, async (req, res) => {
    try {
        const { serverId } = req.params;
        const existing = await prisma.serverMember.findUnique({
            where: {
                userId_serverId: {
                    userId: req.user.userId,
                    serverId,
                },
            },
        });
        if (existing) {
            return res.status(400).json({
                message: "Already a member",
            });
        }
        const member = await prisma.serverMember.create({
            data: {
                userId: req.user.userId,
                serverId,
            },
        });
        return res.status(201).json(member);
    }
    catch (error) {
        console.error("Join server error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.get("/", authMiddleware, async (req, res) => {
    try {
        const servers = await prisma.serverMember.findMany({
            where: {
                userId: req.user.userId,
            },
            include: {
                server: true,
            },
        });
        return res.json(servers);
    }
    catch (error) {
        console.error("Get servers error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.post("/:serverId/invites", authMiddleware, async (req, res) => {
    try {
        const { serverId } = req.params;
        const member = await prisma.serverMember.findUnique({
            where: {
                userId_serverId: {
                    userId: req.user.userId,
                    serverId,
                },
            },
        });
        if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
            return res.status(403).json({
                message: "Only admin can create invite",
            });
        }
        const code = crypto.randomBytes(4).toString("hex");
        const invite = await prisma.invite.create({
            data: {
                code,
                serverId,
                createdBy: req.user.userId,
            },
        });
        return res.status(201).json(invite);
    }
    catch (error) {
        console.error("Create invite error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.post("/invites/:code/join", authMiddleware, async (req, res) => {
    try {
        const { code } = req.params;
        const invite = await prisma.invite.findUnique({
            where: { code },
        });
        if (!invite) {
            return res.status(404).json({
                message: "Invite not found",
            });
        }
        const existingMember = await prisma.serverMember.findUnique({
            where: {
                userId_serverId: {
                    userId: req.user.userId,
                    serverId: invite.serverId,
                },
            },
        });
        if (existingMember) {
            return res.status(400).json({
                message: "Already a member",
            });
        }
        const member = await prisma.serverMember.create({
            data: {
                userId: req.user.userId,
                serverId: invite.serverId,
                role: "MEMBER",
            },
        });
        return res.status(201).json(member);
    }
    catch (error) {
        console.error("Join invite error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.get("/:serverId/members", authMiddleware, async (req, res) => {
    try {
        const { serverId } = req.params;
        const currentMember = await prisma.serverMember.findUnique({
            where: {
                userId_serverId: {
                    userId: req.user.userId,
                    serverId,
                },
            },
        });
        if (!currentMember) {
            return res.status(403).json({
                message: "You are not a member of this server",
            });
        }
        const members = await prisma.serverMember.findMany({
            where: {
                serverId,
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        return res.json(members);
    }
    catch (error) {
        console.error("Get members error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
export default router;
//# sourceMappingURL=server.routes.js.map