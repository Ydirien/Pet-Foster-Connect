import axios from "axios";
import { generateAccessToken } from "../src/lib/tokens.ts";
import { config } from "../config.ts";
import type { Role } from "../src/lib/roles.ts";

export const apiBaseUrl = `http://localhost:${process.env.PORT}/api`;

export const anonymousRequester = axios.create({
    baseURL: apiBaseUrl,
    validateStatus: () => true,
});

export function buildAuthedRequester(user: { id: number; role: Role }) {
    const accessToken = generateAccessToken(
        { id: user.id, role: user.role },
        config.accessTokenSecret,
    );

    return axios.create({
        baseURL: apiBaseUrl,
        headers: { Authorization: `Bearer ${accessToken.token}` },
        validateStatus: () => true,
    });
}