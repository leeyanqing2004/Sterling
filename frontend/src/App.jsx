import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import OrganizerManageEvent from "./pages/OrganizerManageEvent";
import ProfileShell from "./components/Profile/ProfileShell.jsx";
import MyEvents from "./pages/MyEvents.jsx";
import MyRedemptions from "./pages/MyRedemptions.jsx";
import UserSearch from './pages/UserSearch';
import AllRaffles from './pages/Raffles';
import MyRaffles from './pages/MyRaffles';

function RootRedirect() {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
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
            <Route path="/organizer-manage-event/:id" element={<OrganizerManageEvent />} />
            <Route path="/published-events" element={<PublishedEvents />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/redeem-points" element={<RedeemPoints />} />
            <Route path="/my-redemptions" element={<MyRedemptions />} />
            <Route path="/all-transactions" element={<AllTransactions />} />
            <Route path="/past-transactions" element={<PastTransactions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user-search" element={<UserSearch />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/all-raffles" element={<AllRaffles />} />
            <Route path="/my-raffles" element={<MyRaffles />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
