import argon2 from "argon2";
import type { Request , Response } from "express";
import { prisma } from "../models/index.ts"
import type { RefreshToken, User } from "../models/index.ts"
import z from "zod";
import { config } from "../../config.ts";
import { ConflictError, UnauthorizedError } from "../lib/errors.ts";
import { generateAccessToken,generateRefreshToken,generateResetPasswordToken,setAccessTokenCookie,setRefreshTokenCookie ,type Token } from "../lib/tokens.ts";

const passwordSchema = z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");