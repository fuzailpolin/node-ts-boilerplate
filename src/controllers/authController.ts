import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import passport from "passport";
import { logger } from "../logging";

const prisma = new PrismaClient();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;
    logger.info(`Register attempt for email: ${email}`);
    if (!email || !password) {
      logger.error("Email and password are required.");
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      logger.warn(`Registration failed: Email already in use: ${email}`);
      return res.status(409).json({ message: "Email already in use." });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name },
    });
    req.login(user, (err) => {
      if (err) {
        logger.error({ message: "Login after register failed", error: err });
        return next(err);
      }
      logger.info(`User registered and logged in: ${user.id}`);
      return res
        .status(201)
        .json({ user: { id: user.id, email: user.email, name: user.name } });
    });
  } catch (err) {
    logger.error({ message: "Register error", error: err });
    next(err);
  }
};

export const login = (req: Request, res: Response) => {
  logger.info(`Login successful for user: ${(req.user as any)?.id}`);
  res.json({ user: req.user });
};

export const logout = (req: Request, res: Response) => {
  logger.info(`Logout attempt for user: ${(req.user as any)?.id}`);
  req.logout((err) => {
    if (err) {
      logger.error({ message: "Logout failed", error: err });
      return res.status(500).json({ message: "Logout failed." });
    }
    logger.info("User logged out successfully");
    res.json({ message: "Logged out." });
  });
};

export const socialCallback = (req: Request, res: Response) => {
  // Redirect or respond after social login
  res.redirect("/");
};
