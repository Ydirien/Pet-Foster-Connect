// Mock d'envoi d'email : à remplacer par un vrai transporteur (nodemailer,
// service tiers...) en production. Pour l'instant, on affiche simplement le
// lien de réinitialisation dans la console pour pouvoir tester le flow en
// développement.
//
// Volontairement un console.log et non logger.info : le logger écrit aussi
// dans errors.log/combined.log sur le disque, et ce token permet de prendre
// le contrôle d'un compte pendant 15 minutes. Il ne doit pas finir dans un
// fichier de log persistant.
export const mailer = {
    async sendResetPasswordEmail(email: string, token: string): Promise<void> {
        console.log("Email de réinitialisation (mock)", { to: email, resetToken: token });
    },
};