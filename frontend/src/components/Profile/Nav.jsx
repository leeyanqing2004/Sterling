import { useAuth } from "../../contexts/AuthContext.jsx";
<<<<<<< HEAD
import { Link, useLocation } from "react-router-dom";
import "./Nav.css";
=======
import styles from "./Nav.module.css";
>>>>>>> origin/main

function Nav({ id, className }) {
    const { user } = useAuth();
<<<<<<< HEAD
    const location = useLocation();
    const path = location.pathname.toLowerCase();
    const isManager = user?.role === "manager" || user?.role === "superuser";
    const eventsPath = isManager ? "/all-events" : "/published-events";

    const isEvents = path.startsWith("/published-events") || path.startsWith("/all-events");
    const isHome = path === "/home";
    const isAllUsers = path.startsWith("/all-users");
    const isAllTransactions = path.startsWith("/all-transactions");

    return (<nav id={id} className="nav">
                <ul className="nav-list">
                    <li className="nav-list-item">
                        <Link className={`nav-list-item-link ${isEvents ? "active" : ""}`} to={eventsPath}>Events</Link>
                    </li>
                    {isManager && (
                        <li className="nav-list-item">
                            <Link className={`nav-list-item-link ${isAllUsers ? "active" : ""}`} to="/all-users">Users</Link>
                        </li>
                    )}
                    {isManager && (
                        <li className="nav-list-item">
                            <Link className={`nav-list-item-link ${isAllTransactions ? "active" : ""}`} to="/all-transactions">Transactions</Link>
                        </li>
                    )}
                    <li className="nav-list-item">
                        <Link className={`nav-list-item-link ${isHome ? "active" : ""}`} to="/home">Profile</Link>
=======
    const managerOrHigher = user?.role === "manager" || user?.role === "superuser" || false;

    return (<nav id={id} className={`${styles.nav} ${className || ''}`}>
                <ul className={styles.navList}>
                    {managerOrHigher ? (
                        <li className={styles.navListItem}>
                            <a className={styles.navListItemLink} href="/all-events">Events</a>
                        </li>
                    ) : (
                        <li className={styles.navListItem}>
                            <a className={styles.navListItemLink} href="/published-events">Events</a>
                        </li>
                    )}
                    <li className={styles.navListItem}>
                        <a className={styles.navListItemLink} href="/all-promotions">Promotions</a>
                    </li>
                    <li className={styles.navListItem}>
                        <a className={styles.navListItemLink} href={"/profile"}>Profile</a>
>>>>>>> origin/main
                    </li>
                    {user?.role === "superuser" && (
                        <>
                            <li className={styles.navListItem}>
                                <a className={styles.navListItemLink} href="/all-users">Users</a>
                            </li>
                            <li className={styles.navListItem}>
                                <a className={styles.navListItemLink} href="/all-transactions">Transactions</a>
                            </li>
                        </>
                    )}
                </ul>
    </nav>);
}

export default Nav;
