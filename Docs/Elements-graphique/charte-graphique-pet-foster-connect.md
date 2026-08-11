# Charte graphique

Cette charte reprend les couleurs, typographies et éléments visuels réellement utilisés dans le projet, définis dans `cli/src/styles/variables.css` et appliqués dans les maquettes (`Docs/Elements-graphique/Maquettes/`).

## Logo

Le logo utilisé dans l'application se trouve dans `cli/src/assets/logos/pet-foster-connect-logo-header.png`, affiché dans l'en-tête du site (`Header.tsx`).

Deux variantes transparentes sont prévues pour s'adapter à un fond clair ou foncé :

- `Logo-Transparent-Anthracite.png` : logo en version foncée, pour un fond clair.
- `Logo-Transparent-Creme.png` : logo en version claire, pour un fond foncé (comme l'en-tête ou le pied de page).

Trois pistes de logo ont été explorées avant de choisir la version finale : `Logo-1-Chaleureux.png`, `Logo-2-NatureConfiance.png`, `Logo-3-EnergieAccueil.png`.

## Couleurs

| Nom | Variable CSS | Valeur | Usage |
|---|---|---|---|
| Crème | `--creme` | `#F6F1E7` | Couleur de fond principale |
| Terracotta | `--terracotta` | `#A84F2A` | Couleur principale (boutons, liens, accents) |
| Terracotta foncé | `--terracotta-dark` | `#8A431F` | État survol/actif de la couleur principale |
| Sauge | `--sauge` | `#506B55` | Couleur secondaire (validations, éléments positifs) |
| Sauge foncée | `--sauge-dark` | `#3E5741` | État survol/actif de la couleur secondaire |
| Anthracite | `--anthracite` | `#2B2A28` | Texte principal, fonds foncés (footer) |
| Gris moyen | `--line` | `#E3DFD6` | Bordures, séparateurs |
| Gris texte | `--muted` | `#625E55` | Texte secondaire |

Les teintes terracotta, sauge et gris texte ont été assombries par rapport à la charte d'origine pour respecter le contraste minimum de 4.5:1 exigé par le RGAA (critère 3.2), une fois testées sur fond blanc/crème.

## Typographie

| Usage | Police | Variable CSS |
|---|---|---|
| Titres | Poppins | `--font-heading` |
| Texte courant | Inter | `--font-body` |

Les deux polices sont chargées via les paquets `@fontsource/inter` et `@fontsource/poppins` (auto-hébergées, sans appel à un service externe type Google Fonts).

### Échelle des tailles de titres

| Niveau | Mobile | Desktop (≥ 1024px) |
|---|---|---|
| H1 | 32px | 40px |
| H2 | 24px | 28px |
| H3 | 18px | 20px |
| Corps de texte | 16px | 16px |
| Texte secondaire | 14px | 14px |
| Légende | 12px | 12px |

Seuls les titres grossissent sur desktop : le corps de texte reste identique sur tous les supports.

## Espacements

Une échelle d'espacement commune est utilisée pour les marges et paddings, de 4px à 64px (`--space-1` à `--space-10`), pour garder une mise en page cohérente entre les pages.

## Formes et ombres

- Les boutons et badges utilisent des coins très arrondis (`border-radius: 999px`), pour un style doux et accueillant.
- Les cartes (fiches animal, blocs d'information) utilisent des coins moyennement arrondis (12 à 16px).
- Les ombres sont teintées d'anthracite plutôt que de noir pur, pour rester cohérentes avec la palette (`--shadow-sm`, `--shadow-md`, `--shadow-lift`).

## Iconographie

Les icônes utilisées dans l'interface proviennent de la bibliothèque **Lucide React** (voir `Docs/Cahier-des-charges/6-technologies-pet-foster-connect.md`), pour garder un style d'icônes cohérent dans toute l'application.
