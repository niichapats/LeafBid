import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PlantManagementPage from './pages/PlantManagementPage.jsx'
import AuctionManagementPage from './pages/AuctionManagementPage.jsx'
import AdminPlantsPage from './pages/AdminPlantsPage.jsx'
import AdminAuctionsPage from './pages/AdminAuctionsPage.jsx'
import BiddingRoomPage from './pages/BiddingRoomPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-plants" element={<PlantManagementPage />} />
        <Route path="/create-auction" element={<AuctionManagementPage />} />
        <Route path="/admin/plants" element={<AdminPlantsPage />} />
        <Route path="/admin/auctions" element={<AdminAuctionsPage />} />
        <Route path="/auctions" element={<Navigate to="/" replace />} />
        <Route path="/auctions/:id" element={<BiddingRoomPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
