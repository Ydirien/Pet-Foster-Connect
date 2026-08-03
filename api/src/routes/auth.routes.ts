import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

export const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authenticate, authController.logoutUser);
router.get("/me", authenticate, authController.getAuthenticatedUser);
router.post("/refresh", authController.refreshTokens);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);