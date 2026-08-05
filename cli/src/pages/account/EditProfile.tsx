import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/userService";
import type { CurrentUser } from "../../types/Auth";
import { EditFosterProfile } from "./EditFosterProfile";
import { EditAssociationProfile } from "./EditAssociationProfile";
import "./EditProfile.css";

export function EditProfile() {
    const [account, setAccount] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser()
            .then(setAccount)
            .catch(() => navigate("/connexion", { replace: true }))
            .finally(() => setIsLoading(false));
    }, [navigate]);

    if (isLoading || !account) return <p className="edit-profile__state">Chargement...</p>;

    return account.role === "foster" ? (
        <EditFosterProfile account={account} />
    ) : (
        <EditAssociationProfile account={account} />
    );
}