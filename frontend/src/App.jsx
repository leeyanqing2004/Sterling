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
          <Route path="/profile" element={<Profile />} />
          <Route path="/transfer-points" element={<Profile />} />
          
          <Route path="/home" element={<ProfileShell><Dashboard /></ProfileShell>} />
          <Route path="/past-transactions" element={<ProfileShell><PastTransactions /></ProfileShell>} />
          <Route path="/redeem-points" element={<ProfileShell><RedeemPoints /></ProfileShell>} />
          <Route path="/my-events" element={<ProfileShell><MyEvents /></ProfileShell>} />
          <Route path="/available-promotions" element={<ProfileShell><AvailablePromotions /></ProfileShell>} />
          <Route path="/manage-event/:eventId" element={<ProfileShell><ManageEvent /></ProfileShell>} />
          <Route path="/published-events" element={<ProfileShell><PublishedEvents /></ProfileShell>} />

          <Route path="/all-users" element={<ProfileShell><AllUsers /></ProfileShell>} />
          <Route path="/all-events" element={<ProfileShell><AllEvents /></ProfileShell>} />
          <Route path="/all-promotions" element={<ProfileShell><AllPromotions /></ProfileShell>} />
          <Route path="/all-transactions" element={<ProfileShell><AllTransactions /></ProfileShell>} />
          <Route path="/user-search" element={<ProfileShell><UserSearch /></ProfileShell>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
