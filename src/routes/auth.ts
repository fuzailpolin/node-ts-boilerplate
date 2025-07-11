import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  socialCallback,
} from "../controllers/authController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Email already in use
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", passport.authenticate("local"), login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 *       500:
 *         description: Logout failed
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Start Google OAuth2 login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after login
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  socialCallback
);

/**
 * @swagger
 * /auth/facebook:
 *   get:
 *     summary: Start Facebook OAuth2 login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Facebook
 */
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
/**
 * @swagger
 * /auth/facebook/callback:
 *   get:
 *     summary: Facebook OAuth2 callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after login
 */
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  socialCallback
);

export default router;
