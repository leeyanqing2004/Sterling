import { useAuth } from "../../contexts/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";
import styles from "./Nav.module.css";

function Nav({ id, onToggleNav, navOpen = true, className = "" }) {
    const { user } = useAuth();
    const location = useLocation();
    const path = location.pathname.toLowerCase();
    const isManager = user?.role === "manager" || user?.role === "superuser";
    const eventsPath = isManager ? "/all-events" : "/published-events";
    const promotionsPath = isManager ? "/all-promotions" : "/available-promotions";

    const isEvents = path.startsWith("/published-events") || path.startsWith("/all-events");
    const profilePath = user ? `/profile` : "/login";
    const dashboardPath = user ? `/dashboard` : "/login";
    const isDashboard = path === "/dashboard";
    const isProfile = path.startsWith("/profile");
    const isAllUsers = path.startsWith("/all-users");
    const isAllTransactions = path.startsWith("/all-transactions");
    const isPromotions = path.startsWith("/all-promotions") || path.startsWith("/available-promotions");
    const navClassNames = `${styles.nav} ${className}`.trim();

    return (
        <nav id={id} className={navClassNames}>
            {onToggleNav && (
                <button
                    type="button"
                    className={styles.navToggle}
                    aria-label={`${navOpen ? "Collapse" : "Expand"} sidebar`}
                    aria-expanded={navOpen}
                    onClick={onToggleNav}
                >
                    <span className={styles.navToggleIcon} />
                </button>
            )}
            <ul className={styles.navList}>
                <li className={styles.navListItem}>
                    <Link className={`${styles.navListItemLink} ${isDashboard ? styles.active : ""}`} to={dashboardPath}>Dashboard</Link>
                </li>

                <li className={styles.navListItem}>
                    <Link className={`${styles.navListItemLink} ${isEvents ? styles.active : ""}`} to={eventsPath}>Events</Link>
                </li>

                <li className={styles.navListItem}>
                    <Link className={`${styles.navListItemLink} ${isPromotions ? styles.active : ""}`} to={promotionsPath}>Promotions</Link>
                </li>
                {isManager && (
                    <li className={styles.navListItem}>
                        <Link className={`${styles.navListItemLink} ${isAllUsers ? styles.active : ""}`} to="/all-users">Users</Link>
                    </li>
                )}
                {isManager && (
                    <li className={styles.navListItem}>
                        <Link className={`${styles.navListItemLink} ${isAllTransactions ? styles.active : ""}`} to="/all-transactions">Transactions</Link>
                    </li>
                )}
                <li className={styles.navListItem}>
                    <Link className={`${styles.navListItemLink} ${isProfile ? styles.active : ""}`} to={profilePath}>Profile</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Nav;
