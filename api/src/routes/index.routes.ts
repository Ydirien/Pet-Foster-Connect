import { Router } from "express";
import { router as authRouter } from "./auth.routes.ts";

export const router = Router();

router.use("/auth", authRouter);