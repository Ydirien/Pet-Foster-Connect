import type { FosterRequestStatus } from "../../../types/FosterRequest";
import "./RequestStatusBadge.css";

const LABELS: Record<FosterRequestStatus, string> = {
    pending: "En attente",
    accepted: "Validée",
    rejected: "Refusée",
    cancelled: "Annulée",
};

interface RequestStatusBadgeProps {
    status: FosterRequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
    return (
        <span className={`request-status-badge request-status-badge--${status}`}>
            {LABELS[status]}
        </span>
    );
}