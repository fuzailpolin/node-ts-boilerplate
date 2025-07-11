import { Router, Request, Response } from "express";
import multer from "multer";
import { uploadFile } from "../services/s3Service";

/**
 * @swagger
 * tags:
 *   name: File
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload a file to S3
 *     tags: [File]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: File upload failed
 */
const router = Router();
const upload = multer();

// Example: POST /file (multipart/form-data, file field)
router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response, next) => {
    if (!req.user) {
      const err = new Error("Unauthorized");
      (err as any).status = 401;
      return next(err);
    }
    if (!req.file) {
      const err = new Error("No file uploaded");
      (err as any).status = 400;
      return next(err);
    }
    try {
      const result = await uploadFile(
        req.file.buffer,
        req.file.mimetype,
        (req.user as any).id
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
