import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./auth/auth.routes.js";
import serverRoutes from "./server/server.routes.js";
import channelRoutes from "./channel/channel.routes.js";
import messageRoutes from "./message/message.routes.js";
import { prisma } from "./lib/prisma.js";

import conversationRoutes from "./conversation/conversation.routes.js";
import path from "path";

dotenv.config();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const app = express();
const httpServer = http.createServer(app);
const onlineUsers = new Map<string, string>();
export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  }),
);

app.use(express.json({ limit: '50mb' }));
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/auth", authRoutes);
app.use("/servers", serverRoutes);
app.use("/channels", channelRoutes);
app.use("/messages", messageRoutes);
app.use("/conversations", conversationRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("user:online", (userId: string) => {
    console.log("User online:", userId);

    onlineUsers.set(userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("join-channel", (channelId: string) => {
    socket.join(channelId);
  });

  socket.on("join-conversation", (conversationId: string) => {
    socket.join(conversationId);
  });

  socket.on("typing:start", ({ channelId, username }) => {
    socket.to(channelId).emit("typing:start", {
      channelId,
      username,
    });
  });

  socket.on("typing:stop", ({ channelId, username }) => {
    socket.to(channelId).emit("typing:stop", {
      channelId,
      username,
    });
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("online-users", Array.from(onlineUsers.keys()));

    console.log("Socket disconnected:", socket.id);

    socket.on("call:join", ({ conversationId }) => {
  socket.join(`call:${conversationId}`);
  socket.to(`call:${conversationId}`).emit("call:user-joined", {
    socketId: socket.id,
  });
});

socket.on("call:offer", ({ conversationId, offer }) => {
  socket.to(`call:${conversationId}`).emit("call:offer", {
    offer,
    socketId: socket.id,
  });
});

socket.on("call:answer", ({ conversationId, answer }) => {
  socket.to(`call:${conversationId}`).emit("call:answer", {
    answer,
    socketId: socket.id,
  });
});

socket.on("call:ice-candidate", ({ conversationId, candidate }) => {
  socket.to(`call:${conversationId}`).emit("call:ice-candidate", {
    candidate,
    socketId: socket.id,
  });
});

socket.on("call:leave", ({ conversationId }) => {
  socket.leave(`call:${conversationId}`);
  socket.to(`call:${conversationId}`).emit("call:user-left", {
    socketId: socket.id,
  });
});
  });
});

app.get("/", (_req, res) => {
  res.json({ message: "API running" });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
