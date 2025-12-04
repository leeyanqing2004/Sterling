import { useAuth } from "../../contexts/AuthContext.jsx";
import { Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Nav from "./Nav.jsx";
import LeftNav from "./LeftNav.jsx";
import "./ProfileShell.css";

function ProfileShell({ children }) {
    const { user, authLoading } = useAuth();
    const location = useLocation();
    const [navOpen, setNavOpen] = useState(true);

    if (authLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
        <div className="profile-shell">
            <div className="profile-shell-nav">
                <Nav />
            </div>
            <div className="profile-shell-body">
                <button
                    className="profile-shell-toggle"
                    onClick={() => setNavOpen(prev => !prev)}
                    aria-label="Toggle navigation"
                    type="button"
                >
                    ☰
                </button>
                <div className={`profile-shell-left ${navOpen ? "open" : "collapsed"}`}>
                    <LeftNav />
                </div>
                <div className={`profile-shell-right ${navOpen ? "with-nav" : "expanded"}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default ProfileShell;
