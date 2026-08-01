import jwt, { type JwtPayload } from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import type { Response } from "express";
import type { Role } from "./roles.ts";

export interface Token {
    token: string;
    type: string;
    expiresInMS: number;
}

export interface AccessTokenPayload {
    id: number;
    role: Role;
}

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

// -----------------------------
// Access token (JWT)
// -----------------------------

export function generateAccessToken(user: AccessTokenPayload, secret: string): Token {
    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
        expiresIn: "15m",
    });

    return {
        token,
        type: "Bearer",
        expiresInMS: ACCESS_TOKEN_TTL_MS,
    };
}

export function verifyAccessToken(token: string, secret: string): AccessTokenPayload {
    const payload = jwt.verify(token, secret) as JwtPayload;
    return { id: payload.id, role: payload.role };
}

export function setAccessTokenCookie(res: Response, accessToken: Token) {
    res.cookie("accessToken", accessToken.token, {
        httpOnly: true,
        maxAge: accessToken.expiresInMS,
        sameSite: "none",
        secure: isProduction,
    });
}

// -----------------------------
// Refresh token (chaîne aléatoire stockée en base)
// -----------------------------

export function generateRefreshToken(): Token {
    const token = randomBytes(64).toString("hex");

    return {
        token,
        type: "Bearer",
        expiresInMS: REFRESH_TOKEN_TTL_MS,
    };
}

export function setRefreshTokenCookie(res: Response, refreshToken: Token) {
    res.cookie("refreshToken", refreshToken.token, {
        httpOnly: true,
        maxAge: refreshToken.expiresInMS,
        sameSite: "none",
        secure: isProduction,
        path: "/api/auth/refresh",
    });
}

// -----------------------------
// Reset password token (chaîne aléatoire stockée en base, envoyée par email)
// -----------------------------

export function generateResetPasswordToken(): Token {
    const token = randomBytes(64).toString("hex");

    return {
        token,
        type: "Bearer",
        expiresInMS: RESET_TOKEN_TTL_MS,
    };
}