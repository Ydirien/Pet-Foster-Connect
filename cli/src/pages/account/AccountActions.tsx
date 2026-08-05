import { useNavigate } from "react-router-dom";
import { deleteCurrentUser } from "../../services/userService";
import { useAuth } from "../../context/useAuth";

export function AccountActions() {
    const navigate = useNavigate();
    const auth = useAuth();

    async function handleLogout() {
        await auth.logout();
        navigate("/connexion");
    }

    async function handleDelete() {
        const message =
            auth.user?.role === "association"
                ? "Supprimer définitivement votre compte ? Tous les animaux que vous avez publiés seront également supprimés. Cette action est irréversible."
                : "Supprimer définitivement votre compte ? Cette action est irréversible.";
        if (!window.confirm(message)) {
            return;
        }

        try {
            await deleteCurrentUser();
            await auth.logout();
            navigate("/");
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "Une erreur est survenue.");
        }
    }

    return (
        <div className="account__actions">
            <button type="button" className="account__action account__action--logout" onClick={handleLogout}>
                Se déconnecter
            </button>
            <button type="button" className="account__action account__action--delete" onClick={handleDelete}>
                Supprimer mon compte
            </button>
        </div>
    );
}