import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { listAnimals } from "../../services/animalService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Animal, AgeCategory, Gender } from "../../types/Animal";
import { AnimalCard } from "../../components/common/AnimalCard/AnimalCard";
import { CityRadiusFilter, type CityRadiusValue } from "../../components/common/CityRadiusFilter/CityRadiusFilter";
import "./Animals.css";

const AGE_OPTIONS: { value: AgeCategory; label: string }[] = [
    { value: "puppy", label: "Chiot" },
    { value: "adult", label: "Adulte" },
    { value: "senior", label: "Senior" },
];

const DEFAULT_RADIUS_KM = 25;
const PAGE_SIZE = 4;

export function Animals() {
    const [searchParams] = useSearchParams();
    const speciesId = searchParams.get("speciesId");

    const [animals, setAnimals] = useState<Animal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const [cityRadius, setCityRadius] = useState<CityRadiusValue>({
        city: null,
        radiusKm: DEFAULT_RADIUS_KM,
    });
    const [breed, setBreed] = useState("");
    const [debouncedBreed, setDebouncedBreed] = useState("");
    const [ageCategory, setAgeCategory] = useState<AgeCategory | "">("");
    const [gender, setGender] = useState<Gender | "">("");
    const [neutered, setNeutered] = useState<"" | "true" | "false">("");
    useDocumentTitle("Animaux à accueillir");

    // On attend que l'utilisateur arrête de taper avant de mettre à jour la
    // recherche, pour ne pas lancer une requête à chaque lettre tapée dans
    // le champ "Race".
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedBreed(breed), 300);
        return () => clearTimeout(timeout);
    }, [breed]);

    useEffect(() => {
        // Si les filtres changent à nouveau avant la fin de cette requête, on
        // ignore sa réponse : sinon une réponse arrivée en retard pourrait
        // écraser l'affichage avec un résultat qui ne correspond plus aux
        // filtres actuels.
        let isStale = false;

        setIsLoading(true);
        listAnimals({
            // Cette page ne montre que les animaux réellement à accueillir.
            status: "available",
            ...(speciesId ? { speciesId: Number(speciesId) } : {}),
            ...(cityRadius.city
                ? {
                    lat: cityRadius.city.latitude,
                    lng: cityRadius.city.longitude,
                    radiusKm: cityRadius.radiusKm,
                    }
                : {}),
            ...(debouncedBreed.trim() ? { breed: debouncedBreed.trim() } : {}),
            ...(ageCategory ? { ageCategory } : {}),
            ...(gender ? { gender } : {}),
            ...(neutered ? { neutered: neutered === "true" } : {}),
        })
            .then((data) => {
                if (!isStale) setAnimals(data);
            })
            .catch(() => {
                if (!isStale) setAnimals([]);
            })
            .finally(() => {
                if (!isStale) setIsLoading(false);
            });
        setVisibleCount(PAGE_SIZE);

        return () => {
            isStale = true;
        };
    }, [speciesId, cityRadius, debouncedBreed, ageCategory, gender, neutered]);

    function resetFilters() {
        setCityRadius({ city: null, radiusKm: DEFAULT_RADIUS_KM });
        setBreed("");
        setAgeCategory("");
        setGender("");
        setNeutered("");
    }

    const activeFilterCount =
        (cityRadius.city ? 1 : 0) +
        (breed.trim() ? 1 : 0) +
        (ageCategory ? 1 : 0) +
        (gender ? 1 : 0) +
        (neutered ? 1 : 0);

    return (
        <div className="animals-layout">
            {/* Visuellement caché : le design ne prévoit pas de titre ici, mais la
                page doit tout de même avoir un h1 pour la navigation par titres. */}
            <h1 className="sr-only">Animaux à accueillir</h1>

            <section className="filter-bar">
                <button
                    type="button"
                    className="filter-button"
                    onClick={() => setIsFilterPanelOpen((open) => !open)}
                >
                    Filtrer et trier{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                    <SlidersHorizontal size={16} strokeWidth={1.8} />
                </button>

                <div className={`filter-panel${isFilterPanelOpen ? " filter-panel--open" : ""}`}>
                    <CityRadiusFilter value={cityRadius} onChange={setCityRadius} idPrefix="animals-filter" />

                    <div className="filter-panel__field">
                        <label htmlFor="filter-breed">Race</label>
                        <input
                            id="filter-breed"
                            type="text"
                            placeholder="Ex : Labrador"
                            value={breed}
                            onChange={(event) => setBreed(event.target.value)}
                        />
                    </div>

                    <div className="filter-panel__field">
                        <label htmlFor="filter-age">Âge</label>
                        <select
                            id="filter-age"
                            value={ageCategory}
                            onChange={(event) => setAgeCategory(event.target.value as AgeCategory | "")}
                        >
                            <option value="">Tous</option>
                            {AGE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-panel__field">
                        <label htmlFor="filter-gender">Sexe</label>
                        <select
                            id="filter-gender"
                            value={gender}
                            onChange={(event) => setGender(event.target.value as Gender | "")}
                        >
                            <option value="">Indifférent</option>
                            <option value="male">Mâle</option>
                            <option value="female">Femelle</option>
                        </select>
                    </div>

                    <div className="filter-panel__field">
                        <label htmlFor="filter-neutered">Stérilisé</label>
                        <select
                            id="filter-neutered"
                            value={neutered}
                            onChange={(event) => setNeutered(event.target.value as "" | "true" | "false")}
                        >
                            <option value="">Indifférent</option>
                            <option value="true">Oui</option>
                            <option value="false">Non</option>
                        </select>
                    </div>

                    {activeFilterCount > 0 && (
                        <button type="button" className="filter-panel__reset" onClick={resetFilters}>
                            Réinitialiser les filtres
                        </button>
                    )}
                </div>
            </section>

            <div className="animals-content">
                <section className="animals-grid">
                    {isLoading ? (
                        <p>Chargement...</p>
                    ) : animals.length === 0 ? (
                        <p>Aucun animal ne correspond à votre recherche.</p>
                    ) : (
                        animals
                            .slice(0, visibleCount)
                            .map((animal) => <AnimalCard key={animal.id} animal={animal} />)
                    )}
                </section>

                {!isLoading && visibleCount < animals.length && (
                    <div className="animals-load-more">
                        <button
                            type="button"
                            className="animals-load-more__button"
                            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                        >
                            Voir plus
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}