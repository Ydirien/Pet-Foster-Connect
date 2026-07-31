function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

export const config = {
    port: parseInt(process.env.PORT || "3000", 10),
    databaseUrl: requireEnv("DATABASE_URL"),
    allowedOrigins: process.env.ALLOWED_ORIGINS || "*",
    accessTokenSecret: requireEnv("ACCESS_TOKEN_SECRET"),
    logLevel: process.env.LOG_LEVEL || "http",
    logServiceHost: process.env.LOG_SERVICE_HOST || "log-service",
    logServicePort: parseInt(process.env.LOG_SERVICE_PORT || "3000", 10),
};