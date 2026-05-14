import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const { name, serverId } = req.body;

    if (!name || !serverId) {
      return res.status(400).json({
        message: "name and serverId are required",
      });
    }

    const member = await prisma.serverMember.findUnique({
      where: {
        userId_serverId: {
          userId: req.user.userId,
          serverId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this server",
      });
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        serverId,
      },
    });

    return res.status(201).json(channel);
  } catch (error) {
    console.error("Create channel error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/server/:serverId", authMiddleware, async (req, res) => {
  try {
    const serverId = req.params.serverId;

    if (typeof serverId !== "string") {
      return res.status(400).json({
        message: "serverId is required",
      });
    }

    const member = await prisma.serverMember.findUnique({
      where: {
        userId_serverId: {
          userId: (req as any).user.userId,
          serverId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this server",
      });
    }

    const channels = await prisma.channel.findMany({
      where: {
        serverId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(channels);
  } catch (error) {
    console.error("Get channels error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
