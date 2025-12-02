import { useAuth } from "../../contexts/AuthContext.jsx";
import styles from "./Nav.module.css";

function Nav({ id, className }) {
    const { user } = useAuth();
    return (<nav id={id} className={`${styles.nav} ${className || ''}`}>
                <ul className={styles.navList}>
                    <li className={styles.navListItem}>
                        <a className={styles.navListItemLink} href="/">Events</a>
                    </li>
                    <li className={styles.navListItem}>
                        <a className={styles.navListItemLink} href={`/profile/${user?.utorid}`}>Profile</a>
                    </li>
                    <li className={styles.navListItem}>
                        <a className={styles.navListItemLink} href="/">Settings</a>
                    </li>
                </ul>
    </nav>);
}

export default Nav;