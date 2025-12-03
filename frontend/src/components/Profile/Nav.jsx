import { useAuth } from "../../contexts/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";
import "./Nav.css";

function Nav({ id }) {
    const { user } = useAuth();
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
                    </li>
                </ul>
    </nav>);
}

export default Nav;
