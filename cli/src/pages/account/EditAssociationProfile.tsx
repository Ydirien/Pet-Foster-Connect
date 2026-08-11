import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import type { CurrentAssociationUser } from "../../types/Auth";
import { updateAssociation, uploadAssociationImage } from "../../services/associationService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import "./EditProfile.css";

interface EditAssociationProfileProps {
    account: CurrentAssociationUser;
}

export function EditAssociationProfile({ account }: EditAssociationProfileProps) {
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState(account.profile.imageUrl ?? "");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [name, setName] = useState(account.profile.name);
    const [description, setDescription] = useState(account.profile.description ?? "");
    const [address, setAddress] = useState(account.profile.address ?? "");
    const [city, setCity] = useState(account.profile.city);
    const [postalCode, setPostalCode] = useState(account.profile.postalCode ?? "");
    const [openingHours, setOpeningHours] = useState(account.profile.openingHours ?? "");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useDocumentTitle("Modifier mes informations");

    async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = ""; // permet de resélectionner le même fichier ensuite
        if (!file) return;

        setImageError(null);
        setIsUploadingImage(true);
        try {
            const result = await uploadAssociationImage(file);
            setImageUrl(result.imageUrl);
        } catch (err) {
            setImageError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsUploadingImage(false);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await updateAssociation(account.profile.userId, {
                name,
                imageUrl: imageUrl || undefined,
                description: description || undefined,
                address: address || undefined,
                city,
                postalCode: postalCode || undefined,
                openingHours: openingHours || undefined,
            });
            navigate("/compte");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="edit-profile" onSubmit={handleSubmit}>
          <div className="edit-profile__inner">
            <h1 className="edit-profile__title">Modifier mes informations</h1>

            <label
                className="edit-profile__avatar-picker"
                htmlFor="avatar"
                style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
            >
                {isUploadingImage ? (
                    <span>Envoi...</span>
                ) : (
                    !imageUrl && <ImagePlus size={22} strokeWidth={1.6} />
                )}
            </label>
            <input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="edit-profile__avatar-input"
                onChange={handleImageChange}
                disabled={isUploadingImage}
            />
            {imageUrl && !isUploadingImage && (
                <label htmlFor="avatar" className="edit-profile__avatar-change">
                    Changer la photo
                </label>
            )}
            {imageError && <p className="edit-profile__error">{imageError}</p>}

            <div className="edit-profile__card">
                <h2 className="edit-profile__card-title">Identité</h2>
                <p className="edit-profile__readonly">Email : {account.email} (non modifiable)</p>
                <p className="edit-profile__readonly">
                    Téléphone : {account.phone ?? "Non renseigné"} (non modifiable ici)
                </p>
                <p className="edit-profile__readonly">
                    SIRET : {account.profile.siret ?? "Non renseigné"} (non modifiable)
                </p>

                <label className="edit-profile__label" htmlFor="name">Nom de l'association</label>
                <input
                    id="name"
                    className="edit-profile__input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />

                <label className="edit-profile__label" htmlFor="address">Adresse</label>
                <input
                    id="address"
                    className="edit-profile__input"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                />

                <div className="edit-profile__row">
                    <div className="edit-profile__field">
                        <label className="edit-profile__label" htmlFor="city">Ville</label>
                        <input
                            id="city"
                            className="edit-profile__input"
                            value={city}
                            onChange={(event) => setCity(event.target.value)}
                            required
                        />
                    </div>
                    <div className="edit-profile__field">
                        <label className="edit-profile__label" htmlFor="postalCode">Code postal</label>
                        <input
                            id="postalCode"
                            className="edit-profile__input"
                            value={postalCode}
                            onChange={(event) => setPostalCode(event.target.value)}
                        />
                    </div>
                </div>

                <label className="edit-profile__label" htmlFor="openingHours">Horaires</label>
                <textarea
                    id="openingHours"
                    className="edit-profile__textarea"
                    placeholder="Ex : Lundi - vendredi : 10h30 - 12h30 / 14h00 - 17h00"
                    value={openingHours}
                    onChange={(event) => setOpeningHours(event.target.value)}
                />
            </div>

            <div className="edit-profile__card">
                <h2 className="edit-profile__card-title" id="description-label">Description</h2>
                <textarea
                    className="edit-profile__textarea"
                    aria-labelledby="description-label"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </div>

            {error && <p className="edit-profile__error" role="alert">{error}</p>}

            <button type="submit" className="edit-profile__submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
    );
}