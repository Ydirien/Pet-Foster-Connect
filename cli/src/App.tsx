import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Footer } from './components/layout/Footer/Footer'
import { Header } from './components/layout/Header/Header'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)
  const { pathname } = useLocation()

  // À chaque changement de page (hors premier chargement), on ramène le
  // focus sur le contenu principal : sans ça, un utilisateur au clavier ou
  // au lecteur d'écran reste "coincé" sur le lien qu'il vient de cliquer,
  // sans être informé que la page a changé.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [pathname])

  return (
    <>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <Header />
      <main id="main-content" className="app-main" tabIndex={-1} ref={mainRef}>
        <AppRoutes />
      </main>
      <Footer />
    </>
  )
}

export default App