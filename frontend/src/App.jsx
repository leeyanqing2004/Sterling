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
import UserSearch from './pages/UserSearch';

function RootRedirect() {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
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
          <Route path="/profile/:utorid/home" element={<Navigate to="/home" replace />} />
          <Route path="/profile/:utorid/account" element={<Profile />} />
          <Route path="/profile/:utorid/transfer-points" element={<Profile />} />
          <Route path="/profile/:utorid/redeem-points" element={<Profile />} />
          <Route path="/profile/:utorid/past-transactions" element={<Profile />} />
          <Route path="/all-users" element={<ProfileShell><AllUsers /></ProfileShell>} />
          <Route path="/all-promotions" element={<ProfileShell><AllPromotions /></ProfileShell>} />
          <Route path="/available-promotions" element={<ProfileShell><AvailablePromotions /></ProfileShell>} />
          <Route path="/all-events" element={<ProfileShell><AllEvents /></ProfileShell>} />
          <Route path="/manage-event/:eventId" element={<ProfileShell><ManageEvent /></ProfileShell>} />
          <Route path="/published-events" element={<ProfileShell><PublishedEvents /></ProfileShell>} />
          <Route path="/home" element={<ProfileShell><Dashboard /></ProfileShell>} />
          <Route path="/redeem-points" element={<ProfileShell><RedeemPoints /></ProfileShell>} />
          <Route path="/all-transactions" element={<ProfileShell><AllTransactions /></ProfileShell>} />
          <Route path="/past-transactions" element={<ProfileShell><PastTransactions /></ProfileShell>} />
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
