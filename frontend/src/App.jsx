import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import MyPlantsPage from './pages/MyPlantsPage.jsx'
import CreateAuctionPage from './pages/CreateAuctionPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-plants" element={<MyPlantsPage />} />
        <Route path="/create-auction" element={<CreateAuctionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
