import { useAuth } from "../../contexts/AuthContext.jsx";
import { useViewRole } from "../../contexts/ViewRoleContext.jsx";
import { Link, useLocation } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import styles from "./Nav.module.css";

function Nav({ id }) {
    const { user } = useAuth();
    const { viewRole, setViewRole } = useViewRole();
    const location = useLocation();
    const path = location.pathname.toLowerCase();
    const isManagerOrHigher = user?.role === "manager" || user?.role === "superuser";
    const eventsPath = isManagerOrHigher ? "/all-events" : "/published-events";

    const isEvents = path.startsWith("/published-events") || path.startsWith("/all-events");
    const profilePath = user ? "/profile" : "/login";
    const isProfile = path.startsWith("/profile") || path === "/home";
    const isAllUsers = path.startsWith("/all-users");
    const isAllTransactions = path.startsWith("/all-transactions");
    const isAllPromotions = path.startsWith("/all-promotions");

    const handleViewRoleChange = (event) => {
        const role = event.target.value;
        if (role === "default") {
            setViewRole(null);
        } else {
            setViewRole(role);
        }
    };

    return (
        <nav id={id} className={styles.nav}>
            <div className={styles.navListContainer}>
                <ul className={styles.navList}>
                    <li className={styles.navListItem}>
                        <Link className={`${styles.navListItemLink} ${isEvents ? styles.active : ""}`} to={eventsPath}>Events</Link>
                    </li>
                    {isManagerOrHigher && (
                        <li className={styles.navListItem}>
                            <Link className={`${styles.navListItemLink} ${isAllUsers ? styles.active : ""}`} to="/all-users">Users</Link>
                        </li>
                    )}
                    {isManagerOrHigher && (
                        <li className={styles.navListItem}>
                            <Link className={`${styles.navListItemLink} ${isAllTransactions ? styles.active : ""}`} to="/all-transactions">Transactions</Link>
                        </li>
                    )}
                    <li className={styles.navListItem}>
                        <Link className={`${styles.navListItemLink} ${isProfile ? styles.active : ""}`} to={profilePath}>Profile</Link>
                    </li>
                    <li className={styles.navListItem}>
                        <Link className={`${styles.navListItemLink} ${isAllPromotions ? styles.active : ""}`} to="/all-promotions">Promotions</Link>
                    </li>
                </ul>
                {isManagerOrHigher && (
                    <Box className={styles.navViewRoleSelector}>
                        <FormControl size="small">
                            <InputLabel>View As</InputLabel>
                            <Select
                                value={viewRole || "default"}
                                label="View as"
                                onChange={handleViewRoleChange}
                            >
                                <MenuItem value="default">Current Role</MenuItem>
                                <MenuItem value="cashier">Cashier</MenuItem>
                                <MenuItem value="regular">Regular</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}
            </div>
        </nav>
    );
}

export default Nav;
