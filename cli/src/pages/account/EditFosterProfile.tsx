import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import type { CurrentFosterUser } from "../../types/Auth";
import type { HousingType, ExperienceLevel, WalkTime, HomePresence, HouseholdPet } from "../../types/Foster";
import { updateFosterProfile, uploadProfilePhoto, addHouseholdPet, removeHouseholdPet } from "../../services/userService";
import { getSpecies } from "../../services/animalService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Species } from "../../types/Animal";
import "./EditProfile.css";

interface EditFosterProfileProps {
    account: CurrentFosterUser;
}

const WALK_TIME_OPTIONS: { value: WalkTime; label: string }[] = [
    { value: "less_than_30min", label: "Moins de 30 minutes" },
    { value: "between_30min_1h", label: "Entre 30 minutes et 1h" },
    { value: "between_1h_2h", label: "Entre 1h et 2h" },
    { value: "more_than_2h", label: "Plus de 2h" },
];

const HOME_PRESENCE_OPTIONS: { value: HomePresence; label: string }[] = [
    { value: "full_time", label: "Présence toute la journée" },
    { value: "part_time", label: "Présence une partie de la journée" },
    { value: "evenings_only", label: "Présence le soir et le week-end uniquement" },
    { value: "variable", label: "Horaires irréguliers" },
];

export function EditFosterProfile({ account }: EditFosterProfileProps) {
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState(account.profile.imageUrl ?? "");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [firstName, setFirstName] = useState(account.profile.firstName);
    const [lastName, setLastName] = useState(account.profile.lastName);
    const [phone, setPhone] = useState(account.phone ?? "");
    const [address, setAddress] = useState(account.profile.address ?? "");
    const [city, setCity] = useState(account.profile.city);
    const [postalCode, setPostalCode] = useState(account.profile.postalCode ?? "");
    const [housingType, setHousingType] = useState<HousingType | "">(account.profile.housingType ?? "");
    const [housingSize, setHousingSize] = useState(account.profile.housingSize?.toString() ?? "");
    const [hasGarden, setHasGarden] = useState(account.profile.hasGarden);
    const [gardenSize, setGardenSize] = useState(account.profile.gardenSize?.toString() ?? "");
    const [walkTime, setWalkTime] = useState<WalkTime | "">(account.profile.walkTime ?? "");
    const [homePresence, setHomePresence] = useState<HomePresence | "">(account.profile.homePresence ?? "");
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">(account.profile.experienceLevel ?? "");
    const [experienceDescription, setExperienceDescription] = useState(account.profile.experienceDescription ?? "");
    const [monthlyBudget, setMonthlyBudget] = useState(account.profile.monthlyBudget?.toString() ?? "");
    const [householdPets, setHouseholdPets] = useState<HouseholdPet[]>(account.profile.householdPets ?? []);
    const [species, setSpecies] = useState<Species[]>([]);
    const [newPetSpeciesId, setNewPetSpeciesId] = useState("");
    const [newPetAge, setNewPetAge] = useState("");
    const [newPetNeutered, setNewPetNeutered] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useDocumentTitle("Modifier mes informations");

    useEffect(() => {
        getSpecies().then(setSpecies).catch(() => setSpecies([]));
    }, []);

    async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = ""; // permet de resélectionner le même fichier ensuite
        if (!file) return;

        setImageError(null);
        setIsUploadingImage(true);
        try {
            const result = await uploadProfilePhoto(file);
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
            await updateFosterProfile({
                firstName,
                lastName,
                imageUrl: imageUrl || undefined,
                phone: phone || undefined,
                address: address || undefined,
                city,
                postalCode: postalCode || undefined,
                housingType: housingType || undefined,
                housingSize: housingSize ? Number(housingSize) : undefined,
                hasGarden,
                gardenSize: hasGarden && gardenSize ? Number(gardenSize) : undefined,
                walkTime: walkTime || undefined,
                homePresence: homePresence || undefined,
                experienceLevel: experienceLevel || undefined,
                experienceDescription: experienceDescription || undefined,
                monthlyBudget: monthlyBudget ? Number(monthlyBudget) : undefined,
            });
            navigate("/compte");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleAddPet() {
        if (!newPetSpeciesId) return;
        setError(null);
        try {
            const pet = await addHouseholdPet({
                speciesId: Number(newPetSpeciesId),
                age: newPetAge ? Number(newPetAge) : undefined,
                neutered: newPetNeutered,
            });
            setHouseholdPets((current) => [...current, pet]);
            setNewPetSpeciesId("");
            setNewPetAge("");
            setNewPetNeutered(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        }
    }

    async function handleRemovePet(petId: number) {
        setError(null);
        try {
            await removeHouseholdPet(petId);
            setHouseholdPets((current) => current.filter((pet) => pet.id !== petId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
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

                <div className="edit-profile__row">
                    <div className="edit-profile__field">
                        <label className="edit-profile__label" htmlFor="firstName">Prénom</label>
                        <input
                            id="firstName"
                            className="edit-profile__input"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            required
                        />
                    </div>
                    <div className="edit-profile__field">
                        <label className="edit-profile__label" htmlFor="lastName">Nom</label>
                        <input
                            id="lastName"
                            className="edit-profile__input"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            required
                        />
                    </div>
                </div>

                <label className="edit-profile__label" htmlFor="phone">Téléphone</label>
                <input id="phone" className="edit-profile__input" value={phone} onChange={(event) => setPhone(event.target.value)} />

                <label className="edit-profile__label" htmlFor="address">Adresse</label>
                <input id="address" className="edit-profile__input" value={address} onChange={(event) => setAddress(event.target.value)} />

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
            </div>

            <div className="edit-profile__card">
                <h2 className="edit-profile__card-title">Logement</h2>

                <div className="edit-profile__row">
                    <div className="edit-profile__field">
                        <label className="edit-profile__label" htmlFor="housingType">Type de logement</label>
                        <select
                            id="housingType"
                            className="edit-profile__input"
                            value={housingType}
                            onChange={(event) => setHousingType(event.target.value as HousingType | "")}
                        >
                            <option value="">Non renseigné</option>
                            <option value="house">Maison</option>
                            <option value="apartment">Appartement</option>
                        </select>
                    </div>
                    <div className="edit-profile__field">
                        <label className="edit-profile__label" htmlFor="housingSize">Superficie (m2)</label>
                        <input
                            id="housingSize"
                            type="number"
                            min={0}
                            className="edit-profile__input"
                            value={housingSize}
                            onChange={(event) => setHousingSize(event.target.value)}
                        />
                    </div>
                </div>

                <label className="edit-profile__checkbox">
                    <input type="checkbox" checked={hasGarden} onChange={(event) => setHasGarden(event.target.checked)} />
                    J'ai un jardin
                </label>

                {hasGarden && (
                    <>
                        <label className="edit-profile__label" htmlFor="gardenSize">Superficie du jardin (m2)</label>
                        <input
                            id="gardenSize"
                            type="number"
                            min={0}
                            className="edit-profile__input"
                            value={gardenSize}
                            onChange={(event) => setGardenSize(event.target.value)}
                        />
                    </>
                )}
            </div>

            <div className="edit-profile__card">
                <h2 className="edit-profile__card-title">Disponibilité</h2>

                <label className="edit-profile__label" htmlFor="walkTime">Temps de promenade / jour</label>
                <select
                    id="walkTime"
                    className="edit-profile__input"
                    value={walkTime}
                    onChange={(event) => setWalkTime(event.target.value as WalkTime | "")}
                >
                    <option value="">Non renseigné</option>
                    {WALK_TIME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <label className="edit-profile__label" htmlFor="homePresence">Présence au domicile</label>
                <select
                    id="homePresence"
                    className="edit-profile__input"
                    value={homePresence}
                    onChange={(event) => setHomePresence(event.target.value as HomePresence | "")}
                >
                    <option value="">Non renseigné</option>
                    {HOME_PRESENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            <div className="edit-profile__card">
                <h2 className="edit-profile__card-title">Expérience</h2>

                <label className="edit-profile__label" htmlFor="experienceLevel">Niveau d'expérience</label>
                <select
                    id="experienceLevel"
                    className="edit-profile__input"
                    value={experienceLevel}
                    onChange={(event) => setExperienceLevel(event.target.value as ExperienceLevel | "")}
                >
                    <option value="">Non renseigné</option>
                    <option value="beginner">Débutant(e)</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="experienced">Expérimenté(e)</option>
                </select>

                <label className="edit-profile__label" htmlFor="experienceDescription">Description de votre expérience</label>
                <textarea
                    id="experienceDescription"
                    className="edit-profile__textarea"
                    value={experienceDescription}
                    onChange={(event) => setExperienceDescription(event.target.value)}
                />
            </div>

            <div className="edit-profile__card">
                <h2 className="edit-profile__card-title" id="monthlyBudget-label">Budget mensuel estimé (€)</h2>
                <input
                    type="number"
                    min={0}
                    max={9999.99}
                    step="0.01"
                    className="edit-profile__input"
                    aria-labelledby="monthlyBudget-label"
                    value={monthlyBudget}
                    onChange={(event) => setMonthlyBudget(event.target.value)}
                />
            </div>

            <div className="edit-profile__card">
                <h2 className="edit-profile__card-title">Animaux déjà présents</h2>

                {householdPets.length > 0 && (
                    <div className="edit-profile__pets">
                        {householdPets.map((pet) => (
                            <div key={pet.id} className="edit-profile__pet">
                                <span>
                                    {pet.species.name}
                                    {pet.age !== null ? `, ${pet.age} ans` : ""}
                                    {pet.neutered ? ", castré" : ""}
                                </span>
                                <button type="button" onClick={() => handleRemovePet(pet.id)}>Retirer</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="edit-profile__add-pet">
                    <label htmlFor="newPetSpeciesId" className="sr-only">Espèce de l'animal déjà présent</label>
                    <select
                        id="newPetSpeciesId"
                        className="edit-profile__input"
                        value={newPetSpeciesId}
                        onChange={(event) => setNewPetSpeciesId(event.target.value)}
                    >
                        <option value="">Espèce...</option>
                        {species.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <label htmlFor="newPetAge" className="sr-only">Âge de l'animal déjà présent</label>
                    <input
                        id="newPetAge"
                        type="number"
                        min={0}
                        placeholder="Âge"
                        className="edit-profile__input"
                        value={newPetAge}
                        onChange={(event) => setNewPetAge(event.target.value)}
                    />
                    <label className="edit-profile__checkbox">
                        <input
                            type="checkbox"
                            checked={newPetNeutered}
                            onChange={(event) => setNewPetNeutered(event.target.checked)}
                        />
                        Castré
                    </label>
                    <button type="button" className="edit-profile__add-btn" onClick={handleAddPet}>
                        Ajouter
                    </button>
                </div>
            </div>

            {error && <p className="edit-profile__error" role="alert">{error}</p>}

            <button type="submit" className="edit-profile__submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
    );
}