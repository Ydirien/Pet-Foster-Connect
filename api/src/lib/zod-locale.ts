import z from "zod";
import { fr } from "zod/locales";

// Traduit les messages d'erreur Zod par défaut (champ requis, format invalide,
// trop court/long...) en français. Import à faire une seule fois, avant la
// première validation (voir app.ts) — les messages custom passés explicitement
// dans un schéma (ex: passwordSchema) ne sont pas affectés par ce réglage.
z.config(fr());