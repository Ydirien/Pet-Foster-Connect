import { useAuth } from "../../context/AuthContext";
import { MyRequests } from "./MyRequests"
import { ReceivedRequests } from "./ReceivedRequests"

export function FosterRequests() {
    const { user } = useAuth();
    return user?.role === "foster" ? <MyRequests /> : <ReceivedRequests />;
}