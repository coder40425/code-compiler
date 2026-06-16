import {
  Request,
  Response,
  NextFunction,
} from "express";
import { verifyToken } from "@clerk/backend";

export interface AuthRequest
  extends Request {
  userId?: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const payload =
      await verifyToken(token, {
        secretKey:
          process.env.CLERK_SECRET_KEY!,
      });

    if (!payload?.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.userId = payload.sub;

    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};