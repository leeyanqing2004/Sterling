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
import ManageEvent from './pages/ManageEvent';
import ProfileShell from "./components/Profile/ProfileShell.jsx";
import MyEvents from "./pages/MyEvents.jsx";
import UserSearch from './pages/UserSearch';

function RootRedirect() {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />

          <Route element={<ProfileShell />}>
            <Route path="/transfer-points" element={<Profile />} />
            <Route path="/redeem-points" element={<Profile />} />
            <Route path="/past-transactions" element={<Profile />} />
            <Route path="/profile/:utorid/account" element={<Profile />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/all-promotions" element={<AllPromotions />} />
            <Route path="/available-promotions" element={<AvailablePromotions />} />
            <Route path="/all-events" element={<AllEvents />} />
            <Route path="/manage-event/:eventId" element={<ManageEvent />} />
            <Route path="/published-events" element={<PublishedEvents />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/redeem-points" element={<RedeemPoints />} />
            <Route path="/all-transactions" element={<AllTransactions />} />
            <Route path="/past-transactions" element={<PastTransactions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user-search" element={<UserSearch />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
