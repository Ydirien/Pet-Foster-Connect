import { useEffect, useState } from "react";
import { searchCitySuggestions, type CitySuggestion } from "../../../services/geocodingService";
import "./CityRadiusFilter.css";

export interface CityRadiusValue {
    city: CitySuggestion | null;
    radiusKm: number;
}

interface CityRadiusFilterProps {
    value: CityRadiusValue;
    onChange: (value: CityRadiusValue) => void;
    idPrefix: string;
}

// Recherche par ville + rayon façon Leboncoin : autocomplétion via l'API
// Adresse (geocodingService), puis curseur de rayon une fois une ville
// sélectionnée. Partagé entre la liste des animaux et celle des associations.
export function CityRadiusFilter({ value, onChange, idPrefix }: CityRadiusFilterProps) {
    const [cityQuery, setCityQuery] = useState(value.city?.label ?? "");
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

    useEffect(() => {
        if (!cityQuery || cityQuery === value.city?.label) {
            setSuggestions([]);
            return;
        }
        const timeout = setTimeout(() => {
            searchCitySuggestions(cityQuery).then(setSuggestions);
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cityQuery]);

    function selectCity(suggestion: CitySuggestion) {
        setCityQuery(suggestion.label);
        setSuggestions([]);
        setIsSuggestionsOpen(false);
        onChange({ city: suggestion, radiusKm: value.radiusKm });
    }

    function clearCity() {
        setCityQuery("");
        setSuggestions([]);
        onChange({ city: null, radiusKm: value.radiusKm });
    }

    const cityInputId = `${idPrefix}-city`;
    const radiusInputId = `${idPrefix}-radius`;

    return (
        <>
            <div className="city-radius-filter__field">
                <label htmlFor={cityInputId}>Ville</label>
                <input
                    id={cityInputId}
                    type="text"
                    autoComplete="off"
                    placeholder="Ex : Lyon"
                    value={cityQuery}
                    onChange={(event) => {
                        setCityQuery(event.target.value);
                        if (value.city) onChange({ city: null, radiusKm: value.radiusKm });
                        setIsSuggestionsOpen(true);
                    }}
                    onFocus={() => setIsSuggestionsOpen(true)}
                    onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
                />
                {isSuggestionsOpen && suggestions.length > 0 && (
                    <ul className="city-radius-filter__suggestions">
                        {suggestions.map((suggestion) => (
                            <li key={suggestion.label}>
                                <button type="button" onMouseDown={() => selectCity(suggestion)}>
                                    {suggestion.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {value.city && (
                <div className="city-radius-filter__field">
                    <label htmlFor={radiusInputId}>
                        Rayon : {value.radiusKm} km autour de {value.city.label}
                    </label>
                    <input
                        id={radiusInputId}
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={value.radiusKm}
                        onChange={(event) => onChange({ city: value.city, radiusKm: Number(event.target.value) })}
                    />
                    <button type="button" className="city-radius-filter__clear" onClick={clearCity}>
                        Retirer le filtre de ville
                    </button>
                </div>
            )}
        </>
    );
}