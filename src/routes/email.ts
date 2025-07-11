import { Router, Request, Response } from "express";
import { sendEmail } from "../services/emailService";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email sending endpoints
 */

/**
 * @swagger
 * /email:
 *   post:
 *     summary: Send an email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - html
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               html:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent
 *       400:
 *         description: Missing fields
 *       500:
 *         description: Failed to send email
 */
// Example: POST /email { to, subject, html }
router.post("/", async (req: Request, res: Response) => {
  const { to, subject, html } = req.body;
  if (!to || !subject || !html)
    return res.status(400).json({ message: "Missing fields" });
  try {
    await sendEmail(to, subject, html);
    res.json({ message: "Email sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email", error: err });
  }
});

export default router;
