import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { resetPassword } from "../../services/AuthService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import "./PasswordReset.css";

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    useDocumentTitle("Réinitialiser mon mot de passe");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (!token) {
            setError("Lien invalide ou expiré. Demandez un nouveau lien.");
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPassword(token, password);
            navigate("/connexion", { state: { passwordReset: true } });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="password-reset">
            <div className="password-reset__inner">
                <div className="password-reset__icon password-reset__icon--sauge">
                    <Lock size={22} strokeWidth={1.8} />
                </div>

                <h1 className="password-reset__title">Nouveau mot de passe</h1>
                <p className="password-reset__subtitle">
                    Choisissez un nouveau mot de passe pour votre compte.
                </p>

                {!token ? (
                    <p className="password-reset__error password-reset__error--centered">
                        Ce lien de réinitialisation est invalide ou a expiré.{" "}
                        <Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link>
                    </p>
                ) : (
                    <form className="password-reset__form" onSubmit={handleSubmit}>
                        <label className="password-reset__label" htmlFor="password">Nouveau mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            className="password-reset__input"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                            minLength={12}
                            required
                        />
                        <p className="password-reset__hint">
                            12 caractères minimum, avec majuscule, minuscule et chiffre.
                        </p>

                        <label className="password-reset__label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="password-reset__input"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            autoComplete="new-password"
                            minLength={12}
                            required
                        />

                        {error && <p className="password-reset__error" role="alert">{error}</p>}

                        <button type="submit" className="password-reset__submit" disabled={isSubmitting}>
                            {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
