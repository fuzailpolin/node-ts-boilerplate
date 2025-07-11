import { Router } from "express";
import authRoutes from "./auth";
import emailRoutes from "./email";
import fileRoutes from "./file";

const router = Router();

router.use("/auth", authRoutes);
router.use("/email", emailRoutes);
router.use("/file", fileRoutes);

export default router;
