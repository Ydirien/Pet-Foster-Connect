import { useEffect } from "react";

// Une SPA ne recharge jamais la page : sans ce hook, le titre de l'onglet
// resterait bloqué sur "Pet Foster Connect" quelle que soit la page. Les
// lecteurs d'écran annoncent ce titre à chaque navigation, c'est donc lui
// qui indique à l'utilisateur sur quelle page il vient d'arriver (RGAA 8.5).
export function useDocumentTitle(title: string) {
    useEffect(() => {
        document.title = `${title} | Pet Foster Connect`;
    }, [title]);
}
