import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import {
    createAnimal,
    deleteAnimal,
    getAnimalBySlug,
    getSpecies,
    updateAnimal,
    uploadAnimalImage,
} from "../../services/animalService";
import type { Gender, Species } from "../../types/Animal";
import "./PublishAnimal.css";

export function PublishAnimal() {
    const { slug } = useParams<{ slug: string }>();
    const isEditing = Boolean(slug);
    const [animalId, setAnimalId] = useState<number | null>(null);
    const [species, setSpecies] = useState<Species[]>([]);
    const [imageUrl, setImageUrl] = useState("");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [speciesId, setSpeciesId] = useState("");
    const [breed, setBreed] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<Gender>("male");
    const [neutered, setNeutered] = useState(false);
    const [behavior, setBehavior] = useState("");
    const [specificNeeds, setSpecificNeeds] = useState("");
    const [incompatibleSpeciesIds, setIncompatibleSpeciesIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getSpecies()
            .then(setSpecies)
            .catch(() => setSpecies([]));
    }, []);

    useEffect(() => {
        if (!slug) return;
        getAnimalBySlug(slug)
            .then((animal) => {
                setAnimalId(animal.id);
                setImageUrl(animal.imageUrl ?? "");
                setName(animal.name);
                setSpeciesId(String(animal.species.id));
                setBreed(animal.breed ?? "");
                setAge(animal.age !== null ? String(animal.age) : "");
                setGender(animal.gender);
                setNeutered(animal.neutered);
                setBehavior(animal.behavior ?? "");
                setSpecificNeeds(animal.specificNeeds ?? "");
                setIncompatibleSpeciesIds(animal.incompatibleSpecies.map(({ species: s }) => s.id));
            })
            .catch(() => setError("Impossible de charger cet animal."))
            .finally(() => setIsLoading(false));
    }, [slug]);

    function toggleIncompatibleSpecies(id: number) {
        setIncompatibleSpeciesIds((current) =>
            current.includes(id) ? current.filter((speciesId) => speciesId !== id) : [...current, id],
        );
    }

    async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = ""; // permet de resélectionner le même fichier ensuite
        if (!file) return;

        setImageError(null);
        setIsUploadingImage(true);
        try {
            const result = await uploadAnimalImage(file);
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

        if (!speciesId) {
            setError("Sélectionnez une espèce.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name,
                breed: breed || undefined,
                gender,
                neutered,
                age: age ? Number(age) : undefined,
                behavior: behavior || undefined,
                specificNeeds: specificNeeds || undefined,
                imageUrl: imageUrl || undefined,
                speciesId: Number(speciesId),
                incompatibleSpeciesIds: incompatibleSpeciesIds.length > 0 ? incompatibleSpeciesIds : undefined,
            };
            if (isEditing && animalId !== null) {
                await updateAnimal(animalId, payload);
            } else {
                await createAnimal(payload);
            }
            navigate("/animaux");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (animalId === null) return;
        if (!window.confirm("Retirer définitivement cet animal de la plateforme ?")) return;

        setIsDeleting(true);
        setError(null);
        try {
            await deleteAnimal(animalId);
            navigate("/compte");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
            setIsDeleting(false);
        }
    }

    if (isLoading) return <p className="publish-animal__state">Chargement...</p>;

    return (
        <section className="publish-animal">
            <h1 className="publish-animal__title">{isEditing ? "Modifier l'animal" : "Publier un animal"}</h1>
            <p className="publish-animal__subtitle">
                {isEditing
                    ? "Mettez à jour la fiche visible par les familles d'accueil"
                    : "Remplissez la fiche pour la rendre visible aux familles d'accueil"}
            </p>

            <form className="publish-animal__form" onSubmit={handleSubmit}>
                <label
                    className="publish-animal__photo"
                    htmlFor="image"
                    style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                >
                    {isUploadingImage ? (
                        <span>Envoi de la photo...</span>
                    ) : (
                        !imageUrl && (
                            <>
                                <ImagePlus size={22} strokeWidth={1.6} />
                                <span>Ajouter une photo</span>
                            </>
                        )
                    )}
                </label>
                <input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="publish-animal__file-input"
                    onChange={handleImageChange}
                    disabled={isUploadingImage}
                />
                {imageUrl && !isUploadingImage && (
                    <label htmlFor="image" className="publish-animal__photo-change">
                        Changer la photo
                    </label>
                )}
                {imageError && <p className="publish-animal__error">{imageError}</p>}

                <label className="publish-animal__label" htmlFor="name">Nom de l'animal</label>
                <input
                    id="name"
                    className="publish-animal__input"
                    placeholder="Nom"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />

                <div className="publish-animal__row">
                    <div className="publish-animal__field">
                        <label className="publish-animal__label" htmlFor="speciesId">Espèce</label>
                        <select
                            id="speciesId"
                            className="publish-animal__input"
                            value={speciesId}
                            onChange={(event) => setSpeciesId(event.target.value)}
                            required
                        >
                            <option value="" disabled>Choisir...</option>
                            {species.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="publish-animal__field">
                        <label className="publish-animal__label" htmlFor="breed">Race</label>
                        <input
                            id="breed"
                            className="publish-animal__input"
                            placeholder="Laika"
                            value={breed}
                            onChange={(event) => setBreed(event.target.value)}
                        />
                    </div>
                </div>

                <div className="publish-animal__row">
                    <div className="publish-animal__field">
                        <label className="publish-animal__label" htmlFor="age">Âge (années)</label>
                        <input
                            id="age"
                            type="number"
                            min={0}
                            max={100}
                            className="publish-animal__input"
                            placeholder="Ex : 3"
                            value={age}
                            onChange={(event) => setAge(event.target.value)}
                        />
                    </div>
                    <div className="publish-animal__field">
                        <span className="publish-animal__label">Sexe</span>
                        <div className="publish-animal__toggle">
                            <button
                                type="button"
                                className={gender === "male" ? "publish-animal__toggle-btn publish-animal__toggle-btn--active" : "publish-animal__toggle-btn"}
                                onClick={() => setGender("male")}
                            >
                                Mâle
                            </button>
                            <button
                                type="button"
                                className={gender === "female" ? "publish-animal__toggle-btn publish-animal__toggle-btn--active" : "publish-animal__toggle-btn"}
                                onClick={() => setGender("female")}
                            >
                                Femelle
                            </button>
                        </div>
                    </div>
                </div>

                <span className="publish-animal__label">Statut</span>
                <div className="publish-animal__toggle publish-animal__toggle--full">
                    <button
                        type="button"
                        className={neutered ? "publish-animal__toggle-btn publish-animal__toggle-btn--active" : "publish-animal__toggle-btn"}
                        onClick={() => setNeutered(true)}
                    >
                        Castré
                    </button>
                    <button
                        type="button"
                        className={!neutered ? "publish-animal__toggle-btn publish-animal__toggle-btn--active" : "publish-animal__toggle-btn"}
                        onClick={() => setNeutered(false)}
                    >
                        Non castré
                    </button>
                </div>

                <label className="publish-animal__label" htmlFor="behavior">Comportement</label>
                <textarea
                    id="behavior"
                    className="publish-animal__textarea"
                    placeholder="Décrivez le comportement de l'animal..."
                    value={behavior}
                    onChange={(event) => setBehavior(event.target.value)}
                />

                <label className="publish-animal__label" htmlFor="specificNeeds">Besoins spécifiques</label>
                <textarea
                    id="specificNeeds"
                    className="publish-animal__textarea"
                    placeholder="Soins, régime particulier..."
                    value={specificNeeds}
                    onChange={(event) => setSpecificNeeds(event.target.value)}
                />

                <span className="publish-animal__label">Incompatible avec</span>
                <div className="publish-animal__pills">
                    {species.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            className={
                                incompatibleSpeciesIds.includes(s.id)
                                    ? "publish-animal__pill publish-animal__pill--active"
                                    : "publish-animal__pill"
                            }
                            onClick={() => toggleIncompatibleSpecies(s.id)}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>

                {error && <p className="publish-animal__error">{error}</p>}

                <button
                    type="submit"
                    className="publish-animal__submit"
                    disabled={isSubmitting || isDeleting || isUploadingImage}
                >
                    {isSubmitting
                        ? isEditing
                            ? "Enregistrement..."
                            : "Publication..."
                        : isEditing
                        ? "Enregistrer les modifications"
                        : "Publier l'animal"}
                </button>

                {isEditing && (
                    <button
                        type="button"
                        className="publish-animal__delete"
                        onClick={handleDelete}
                        disabled={isSubmitting || isDeleting}
                    >
                        {isDeleting ? "Suppression..." : "Retirer cet animal"}
                    </button>
                )}
            </form>
        </section>
    );
}