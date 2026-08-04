import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/userService";
import type { CurrentUser } from "../../types/Auth";
import { FosterAccountView } from "./FosterAccountView";
import { AssociationAccountView } from "./AssociationAccountView";
import "./Account.css";

export function Account() {
    const [account, setAccount] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser()
            .then(setAccount)
            // getCurrentUser a déjà nettoyé le token invalide si la cause est un 401 ;
            // pas de message mort ici, on renvoie directement vers la connexion.
            .catch(() => navigate("/connexion", { replace: true }))
            .finally(() => setIsLoading(false));
    }, [navigate]);

    if (isLoading || !account) return <p className="account__state">Chargement...</p>;

    return account.role === "foster" ? (
        <FosterAccountView account={account} />
    ) : (
        <AssociationAccountView account={account} />
    );
}