import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../services/AuthService";
import { useAuth } from "../../context/useAuth";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import "./Login.css";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    useDocumentTitle("Connexion");
    const state = location.state as
        | { justRegistered?: boolean; passwordReset?: boolean; from?: { pathname: string } }
        | null;
    const infoMessage = state?.justRegistered
        ? "Compte créé avec succès, vous pouvez vous connecter."
        : state?.passwordReset
        ? "Mot de passe réinitialisé avec succès, vous pouvez vous connecter."
        : null;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const { accessToken, user } = await login({ email, password });
            auth.login(accessToken.token, user);
            navigate(state?.from?.pathname ?? "/compte", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="login">
            <div className="login__inner">
                <h1 className="login__title">Bon retour parmi nous</h1>
                <p className="login__subtitle">
                    Connectez-vous pour retrouver vos animaux à accueillir et suivre vos demandes.
                </p>

                {infoMessage && <p className="login__success">{infoMessage}</p>}

                <form className="login__form" onSubmit={handleSubmit}>
                    <label className="login__label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        className="login__input"
                        placeholder="camille.dubois@email.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label className="login__label" htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        className="login__input"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    <Link to="/mot-de-passe-oublie" className="login__forgot">Mot de passe oublié ?</Link>

                    {error && <p className="login__error" role="alert">{error}</p>}

                    <button type="submit" className="login__submit" disabled={isSubmitting}>
                        {isSubmitting ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <p className="login__signup">
                    Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
                </p>
            </div>
        </section>
    );
}