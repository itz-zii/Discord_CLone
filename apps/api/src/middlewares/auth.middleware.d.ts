import type { Request, Response, NextFunction } from "express";
type MyToken = {
    userId: string;
    email: string;
};
export interface AuthRequest extends Request {
    user?: MyToken;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map