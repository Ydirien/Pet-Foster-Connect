import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { requestPasswordReset } from "../../services/AuthService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import "./PasswordReset.css";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    useDocumentTitle("Mot de passe oublié");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await requestPasswordReset(email);
            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="password-reset">
            <div className="password-reset__inner">
                <div className="password-reset__icon password-reset__icon--terracotta">
                    <Lock size={22} strokeWidth={1.8} />
                </div>

                <h1 className="password-reset__title">Mot de passe oublié</h1>

                {isSubmitted ? (
                    <p className="password-reset__subtitle">
                        Si un compte est associé à cette adresse, vous recevrez un e-mail
                        avec un lien pour créer un nouveau mot de passe.
                    </p>
                ) : (
                    <>
                        <p className="password-reset__subtitle">
                            Entrez votre adresse email, nous vous enverrons un lien pour créer un nouveau mot de passe.
                        </p>

                        <form className="password-reset__form" onSubmit={handleSubmit}>
                            <label className="password-reset__label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="password-reset__input"
                                placeholder="camille.dubois@email.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                required
                            />

                            {error && <p className="password-reset__error">{error}</p>}

                            <button type="submit" className="password-reset__submit" disabled={isSubmitting}>
                                {isSubmitting ? "Envoi..." : "Envoyer le lien"}
                            </button>
                        </form>
                    </>
                )}

                <p className="password-reset__login">
                    Vous vous souvenez de votre mot de passe ? <Link to="/connexion">Se connecter</Link>
                </p>
            </div>
        </section>
    );
}
