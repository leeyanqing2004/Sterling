import { useAuth } from "../../contexts/AuthContext.jsx";
import styles from "./Nav.module.css";

function Nav({ id, className }) {
    const { user } = useAuth();
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