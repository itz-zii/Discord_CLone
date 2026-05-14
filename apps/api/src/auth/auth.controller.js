import { prisma } from "../lib/prisma.js";
export const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.json(user);
    }
    catch (error) {
        console.error("Get me error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
//# sourceMappingURL=auth.controller.js.map