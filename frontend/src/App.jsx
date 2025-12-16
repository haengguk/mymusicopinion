import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import BoardPage from './pages/BoardPage'
import PostWritePage from './pages/PostWritePage'
import PostDetailPage from './pages/PostDetailPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'

import ProfilePage from './pages/ProfilePage'
import ArtistPage from './pages/ArtistPage'

// Wrapper component to decide Home vs Dashboard
const HomeRoute = () => {
  const { user, loading } = useAuth()

  if (loading) return null // or a spinner
  return user ? <Dashboard /> : <LandingPage />
}

// Placeholders for now
import SongsPage from './pages/SongsPage'
import SongDetailPage from './pages/SongDetailPage'

import { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function App() {
  return (
    <AuthProvider>
      <SkeletonTheme baseColor="#202020" highlightColor="#444444">
        <div className="min-h-screen bg-slate-950 text-white font-sans antialiased">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/songs" element={<SongsPage />} />
            <Route path="/songs/:itunesTrackId" element={<SongDetailPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/board/write" element={<PostWritePage />} />
            <Route path="/board/:postId" element={<PostDetailPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/artists/:artistName" element={<ArtistPage />} />
          </Routes>
        </div>
      </SkeletonTheme>
    </AuthProvider>
  )
}

export default App
