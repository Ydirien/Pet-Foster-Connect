import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { rateLimiters } from "../middlewares/rate-limit.middleware.ts";

export const router = Router();

router.post("/register", rateLimiters.register,authController.registerUser);
router.post("/login", rateLimiters.login,authController.loginUser);
router.post("/logout", authenticate, authController.logoutUser);
router.get("/me", authenticate, authController.getAuthenticatedUser);
router.post("/refresh", authController.refreshTokens);
router.post("/forgot-password", rateLimiters.forgotPassword, authController.forgotPassword);
router.post("/reset-password", rateLimiters.resetPassword, authController.resetPassword);