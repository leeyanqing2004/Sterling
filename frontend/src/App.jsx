import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import PastTransactions from "./pages/PastTransactions";
import AllTransactions from "./pages/AllTransactions";
import { AuthProvider } from "./contexts/AuthContext";
import { Navigate } from "react-router-dom";
import RedeemPoints from './pages/RedeemPoints';
import PublishedEvents from './pages/PublishedEvents';
import AllEvents from './pages/AllEvents';
import AvailablePromotions from './pages/AvailablePromotions';
import AllPromotions from './pages/AllPromotions';
import AllUsers from './pages/AllUsers';

function App() {
  const [count, setCount] = useState(0)

  return (

    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/all-promotions" element={<AllPromotions />} />
          <Route path="/available-promotions" element={<AvailablePromotions />} />
          <Route path="/all-events" element={<AllEvents />} />
          <Route path="/published-events" element={<PublishedEvents />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/redeem-points" element={<RedeemPoints />} />
          <Route path="/all-transactions" element={<AllTransactions />} />
          <Route path="/past-transactions" element={<PastTransactions />} />
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
