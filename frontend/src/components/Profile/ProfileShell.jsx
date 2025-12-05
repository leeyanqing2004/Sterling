import { useAuth } from "../../contexts/AuthContext.jsx";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Nav from "./Nav.jsx";
import LeftNav from "./LeftNav.jsx";
import "./ProfileShell.css";

function ProfileShell({ children }) {
    const { user, authLoading } = useAuth();
    const location = useLocation();
    const [navOpen, setNavOpen] = useState(true);
    const hasChildren = !!children;

    if (authLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
        <div className="profile-shell">
            <div className="profile-shell-nav">
                <Nav onToggleNav={() => setNavOpen(prev => !prev)} navOpen={navOpen} />
            </div>
            <div className="profile-shell-body">
                <div className={`profile-shell-left ${navOpen ? "open" : "collapsed"}`}>
                    <LeftNav />
                </div>
                <div className={`profile-shell-right ${navOpen ? "with-nav" : "expanded"}`}>
                    {hasChildren ? children : <Outlet />}
                </div>
            </div>
        </div>
    );
}

export default ProfileShell;
