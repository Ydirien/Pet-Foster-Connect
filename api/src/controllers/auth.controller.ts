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

export async function registerUser(req: Request, res: Response) {
    const registerUserBodySchema = z
        .discriminatedUnion("role", [
        z.object({
            role: z.literal("foster"),
            firstName: z.string().min(2),
            lastName: z.string().min(2),
            email: z.email(),
            password: passwordSchema,
            confirm: z.string(),
            city: z.string().min(1),
            address: z.string().optional(),
            postalCode: z.string().optional(),
            phone: z.string().optional(),
        }),
        z.object({
            role: z.literal("association"),
            name: z.string().min(2),
            email: z.email(),
            password: passwordSchema,
            confirm: z.string(),
            city: z.string().min(1),
            address: z.string().optional(),
            postalCode: z.string().optional(),
            phone: z.string().optional(),
            siret: z.string().regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres").optional(),
            description: z.string().optional(),
            openingHours: z.string().optional(),
        }),
        ])
        .refine(data => data.password === data.confirm, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm"],
        });

    const input = await registerUserBodySchema.parseAsync(req.body);

    const existingUser = await prisma.user.findFirst({ where: { email: input.email } });
    if (existingUser) {
        throw new ConflictError("Cet email est déjà utilisé");
    }

    if (input.role === "association" && input.siret) {
        const existingSiret = await prisma.association.findUnique({ where: { siret: input.siret } });
        if (existingSiret) {
        throw new ConflictError("Ce SIRET est déjà utilisé");
        }
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await prisma.user.create({
        data: {
        email: input.email,
        password: passwordHash,
        phone: input.phone ?? null,
        ...(input.role === "foster"
            ? {
                foster: {
                create: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                    city: input.city,
                    address: input.address ?? null,
                    postalCode: input.postalCode ?? null,
                },
                },
            }
            : {
                association: {
                create: {
                    name: input.name,
                    siret: input.siret ?? null,
                    city: input.city,
                    address: input.address ?? null,
                    postalCode: input.postalCode ?? null,
                    description: input.description ?? null,
                    openingHours: input.openingHours ?? null,
                },
                },
            }),
        },
        include: { foster: true, association: true },
    });

    res.status(201).json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: input.role,
        createdAt: user.createdAt,
        profile: input.role === "foster" ? user.foster : user.association,
    });
}

export async function loginUser(req: Request, res: Response) {
    const loginUserBodySchema = z.object({
        email: z.email(),
        password: z.string(),
    });

    const { email, password } = await loginUserBodySchema.parseAsync(req.body);

    const user = await prisma.user.findFirst({
        where: { email },
        include: { foster: true, association: true },
    });

    if (!user) {
        throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    const isMatching = await argon2.verify(user.password, password);

    if (!isMatching) {
        throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    const role = user.foster ? "foster" : "association";

    const accessToken = generateAccessToken({ id: user.id, role }, config.accessTokenSecret);
    const refreshToken = generateRefreshToken();

    await replaceRefreshTokenInDatabase(refreshToken, user.id);

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ accessToken, refreshToken });
}