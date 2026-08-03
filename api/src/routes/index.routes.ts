import { Router } from "express";
import { router as authRouter } from "./auth.routes.ts";
import { router as userRouter } from "./users.routes.ts";
import { router as associationsRouter } from "./associations.routes.ts"

export const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/associations", associationsRouter)