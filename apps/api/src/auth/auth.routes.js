import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getMe } from "./auth.controller.js";
import { io } from "../server.js";
import multer from "multer";
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });
const router = Router();
router.get("/me", authMiddleware, getMe);
router.patch("/me/avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "avatar is required",
            });
        }
        const avatarUrl = `/uploads/${req.file.filename}`;
        const user = await prisma.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                avatarUrl,
            },
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
            },
        });
        return res.json(user);
    }
    catch (error) {
        console.error("Upload avatar error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({
                message: "Email, username and password are required",
            });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        return res.status(201).json({
            message: "Register successfully",
            user,
        });
    }
    catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
        }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.json({
            message: "Login successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
router.post("/:messageId/reactions", authMiddleware, async (req, res) => {
    try {
        const { emoji } = req.body;
        const { messageId } = req.params;
        const userId = req.user.userId;
        if (!emoji) {
            return res.status(400).json({ message: "emoji is required" });
        }
        const existing = await prisma.messageReaction.findUnique({
            where: {
                userId_messageId_emoji: {
                    userId,
                    messageId,
                    emoji,
                },
            },
        });
        if (existing) {
            await prisma.messageReaction.delete({
                where: { id: existing.id },
            });
        }
        else {
            await prisma.messageReaction.create({
                data: {
                    emoji,
                    userId,
                    messageId,
                },
            });
        }
        const reactions = await prisma.messageReaction.groupBy({
            by: ["emoji"],
            where: { messageId },
            _count: true,
        });
        const result = reactions.map((r) => ({
            emoji: r.emoji,
            count: r._count,
        }));
        // emit realtime
        io.emit("message:reaction", {
            messageId,
            reactions: result,
        });
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "error" });
    }
});
export default router;
//# sourceMappingURL=auth.routes.js.map