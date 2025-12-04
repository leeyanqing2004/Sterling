import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navigate } from "react-router-dom";

import Login from './pages/Login';
import Profile from './pages/Profile';
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import Dashboard from "./pages/Dashboard";
import PastTransactions from "./pages/PastTransactions";
import AllTransactions from "./pages/AllTransactions";
import RedeemPoints from './pages/RedeemPoints';
import PublishedEvents from './pages/PublishedEvents';
import AllEvents from './pages/AllEvents';
import AvailablePromotions from './pages/AvailablePromotions';
import AllPromotions from './pages/AllPromotions';
import AllUsers from './pages/AllUsers';
import UserSearch from './pages/UserSearch';

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AllPromotions />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/profile/:utorid/home" element={<Profile />} />
          <Route path="/profile/:utorid/account" element={<Profile />} />
          <Route path="/profile/:utorid/transfer-points" element={<Profile />} />
          <Route path="/profile/:utorid/redeem-points" element={<Profile />} />
          <Route path="/profile/:utorid/past-transactions" element={<Profile />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/transfer-points" element={<Profile />} />
          <Route path="/redeem-points" element={<RedeemPoints />} />
          <Route path="/past-transactions" element={<PastTransactions />} />
          <Route path="/published-events" element={<PublishedEvents />} />
          <Route path="/available-promotions" element={<AvailablePromotions />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/user-search" element={<UserSearch />} />
          <Route path="/all-promotions" element={<AllPromotions />} />
          <Route path="/all-events" element={<AllEvents />} />
          <Route path="/all-transactions" element={<AllTransactions />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
