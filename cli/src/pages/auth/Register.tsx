import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/AuthService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { UserRole } from "../../types/Auth";
import "./Register.css";

export function Register() {
    const [role, setRole] = useState<UserRole>("foster");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [name, setName] = useState("");
    const [siret, setSiret] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    useDocumentTitle("Créer mon compte");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Les deux mots de passe ne correspondent pas.");
            return;
        }

        setIsSubmitting(true);

        try {
            await register(
                role === "foster"
                    ? {
                            role,
                            email,
                            password,
                            confirm: confirmPassword,
                            city,
                            postalCode: postalCode || undefined,
                            firstName,
                            lastName,
                        }
                    : {
                            role,
                            email,
                            password,
                            confirm: confirmPassword,
                            city,
                            postalCode: postalCode || undefined,
                            name,
                            siret: siret || undefined,
                        },
            );
            navigate("/connexion", { state: { justRegistered: true } });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="register">
            <div className="register__inner">
                <h1 className="register__title">Créer mon compte</h1>
                <p className="register__subtitle">
                    Rejoignez la communauté Pet Foster Connect et donnez un foyer temporaire à un animal qui en a besoin.
                </p>

                <div className="register__role-toggle" role="group" aria-label="Je m'inscris en tant que">
                    <button
                        type="button"
                        className={`register__role-btn${role === "foster" ? " register__role-btn--active" : ""}`}
                        aria-pressed={role === "foster"}
                        onClick={() => setRole("foster")}
                    >
                        Je suis famille d'accueil
                    </button>
                    <button
                        type="button"
                        className={`register__role-btn${role === "association" ? " register__role-btn--active" : ""}`}
                        aria-pressed={role === "association"}
                        onClick={() => setRole("association")}
                    >
                        Je suis une association
                    </button>
                </div>

                <form className="register__form" onSubmit={handleSubmit}>
                    {role === "foster" ? (
                        <div className="register__row">
                            <div className="register__field">
                                <label className="register__label" htmlFor="firstName">Prénom</label>
                                <input
                                    id="firstName"
                                    className="register__input"
                                    placeholder="Camille"
                                    value={firstName}
                                    onChange={(event) => setFirstName(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="register__field">
                                <label className="register__label" htmlFor="lastName">Nom</label>
                                <input
                                    id="lastName"
                                    className="register__input"
                                    placeholder="Dubois"
                                    value={lastName}
                                    onChange={(event) => setLastName(event.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <label className="register__label" htmlFor="name">Nom de l'association</label>
                            <input
                                id="name"
                                className="register__input"
                                placeholder="Les Amis des Bêtes"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                            />

                            <label className="register__label" htmlFor="siret">SIRET (facultatif)</label>
                            <input
                                id="siret"
                                className="register__input"
                                placeholder="12345678901234"
                                value={siret}
                                onChange={(event) => setSiret(event.target.value)}
                                inputMode="numeric"
                                maxLength={14}
                            />
                        </>
                    )}

                    <label className="register__label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        className="register__input"
                        placeholder="camille.dubois@email.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label className="register__label" htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        className="register__input"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        minLength={12}
                        required
                    />
                    <p className="register__hint">12 caractères minimum, avec majuscule, minuscule et chiffre.</p>

                    <label className="register__label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className="register__input"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        minLength={12}
                        required
                    />

                    <div className="register__row">
                        <div className="register__field">
                            <label className="register__label" htmlFor="city">Ville</label>
                            <input
                                id="city"
                                className="register__input"
                                placeholder="Lyon"
                                value={city}
                                onChange={(event) => setCity(event.target.value)}
                                required
                            />
                        </div>
                        <div className="register__field">
                            <label className="register__label" htmlFor="postalCode">Code postal</label>
                            <input
                                id="postalCode"
                                className="register__input"
                                placeholder="69000"
                                value={postalCode}
                                onChange={(event) => setPostalCode(event.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="register__error" role="alert">{error}</p>}

                    <button type="submit" className="register__submit" disabled={isSubmitting}>
                        {isSubmitting ? "Création..." : "Créer mon compte"}
                    </button>
                </form>

                <p className="register__login">
                    Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
                </p>

                <p className="register__legal">
                    En créant un compte, vous acceptez nos{" "}
                    <Link to="/mentions-legales">mentions légales</Link> et notre{" "}
                    <Link to="/politique-de-confidentialite">politique de confidentialité</Link>.
                </p>
            </div>
        </section>
    );
}
