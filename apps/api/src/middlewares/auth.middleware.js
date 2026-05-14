import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Token missing",
            });
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            return res.status(500).json({
                message: "JWT_SECRET is missing",
            });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string") {
            return res.status(401).json({
                message: "Invalid token",
            });
        }
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };
        return next();
    }
    catch {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map