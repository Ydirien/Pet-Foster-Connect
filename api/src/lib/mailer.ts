import { logger } from "./logger.ts";

// Mock d'envoi d'email : à remplacer par un vrai transporteur (nodemailer,
// service tiers...) en production. Pour l'instant, on logue simplement le
// lien de réinitialisation pour pouvoir tester le flow en développement.
export const mailer = {
    async sendResetPasswordEmail(email: string, token: string): Promise<void> {
        logger.info("Email de réinitialisation (mock)", { to: email, resetToken: token });
    },
};