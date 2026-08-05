import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

import { Home } from "../pages/home/Home";
import { Animals } from "../pages/animals/Animals";
import { AnimalDetail } from "../pages/animalDetail/AnimalDetail";
import { PublishAnimal } from "../pages/animals/PublishAnimal";
import { Associations } from "../pages/associations/Associations";
import { AssociationDetail } from "../pages/associations/AssociationDetail";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { Account } from "../pages/account/Account";
import { EditProfile } from "../pages/account/EditProfile";
import { CandidateProfile } from "../pages/foster-requests/CandidateProfile";
import { FosterRequests } from "../pages/foster-requests/FosterRequests";
import { LegalNotice } from "../pages/legal/LegalNotice";
import { NotFound } from "../pages/not-found/NotFound";
import { PrivacyPolicy } from "../pages/legal/PrivacyPolicy";

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/animaux" element={<Animals />} />
            <Route path="/animaux/:slug" element={<AnimalDetail />} />
            <Route path="/associations" element={<Associations />} />
            <Route path="/associations/:slug" element={<AssociationDetail />} />

            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />

            <Route
                path="/publier-un-animal"
                element={
                    <ProtectedRoute role="association">
                        <PublishAnimal />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/animaux/:slug/modifier"
                element={
                    <ProtectedRoute role="association">
                        <PublishAnimal />
                    </ProtectedRoute>
                }
            />
            
            <Route
                path="/compte"
                element={
                    <ProtectedRoute>
                        <Account />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/compte/modifier"
                element={
                    <ProtectedRoute>
                        <EditProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/candidats/:fosterId"
                element={
                    <ProtectedRoute role="association">
                        <CandidateProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/candidats/:requestId"
                element={
                    <ProtectedRoute role="association">
                        <CandidateProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/demandes"
                element={
                    <ProtectedRoute>
                        <FosterRequests />
                    </ProtectedRoute>
                }
            />

            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}