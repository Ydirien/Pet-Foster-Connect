import { Footer } from './components/layout/Footer/Footer'
import { Header } from './components/layout/Header/Header'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <>
      <Header />
      <main className="app-main">
        <AppRoutes />
      </main>
      <Footer />
    </>
  )
}

export default App