import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastProvider } from './components/ui'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import CharacterCreatePage from './pages/CharacterCreatePage'
import CharacterPage from './pages/CharacterPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="game/:code" element={<GamePage />} />
            <Route path="game/:code/new" element={<CharacterCreatePage />} />
            <Route path="game/:code/c/:id" element={<CharacterPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
