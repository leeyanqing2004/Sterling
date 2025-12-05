import { matchPath, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import PageButton from "./PageButton.jsx";
import styles from './LeftNav.module.css';

function Menu() {
    return <button className={styles.leftNavMenu}>
        <span className={styles.leftNavMenuBar}></span>
        <span className={styles.leftNavMenuBar}></span>
        <span className={styles.leftNavMenuBar}></span>
    </button>
}

function Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function LeftTop() {
    const { user } = useAuth();
    if (!user) return null;

    const name = user.name || "";
    const utorid = user.utorid || "";
    const role = user.role || "";
    const profilePicture = <img src="/profile.png" alt="Profile Picture" />;
    const userInfo = <div className="left-nav-user-info">
        <h1 className="left-nav-username">{name}</h1>
        <div className="left-nav-user-details">
            <p className="left-nav-UTORid">{utorid}</p>
            <p className="left-nav-user-role">{Capitalize(role)}</p>
        </div>
    </div>;

    return <div className={styles.leftNavLeftTop}>
        {profilePicture}
        {userInfo}
    </div>;
}

function LeftMiddle({ endpoint }) {
    const { user } = useAuth();
    if (!user) {
        return null;
    }
    const isHomeActive = matchPath({ path: "/home" }, endpoint) || matchPath({ path: "/home" }, endpoint);
    const homeTab = <div className="leftNavHomeTab">
        <PageButton text="Home" active={isHomeActive} path="/home"/>
    </div>;

    const isPastTransactionsActive = matchPath({ path: "/past-transactions" }, endpoint);
    const pastTransactionsTab = <div className="leftNavPastTransactionsTab">
        <PageButton text="Past Transactions" active={isPastTransactionsActive} path={`/past-transactions`}/>
    </div>;

    const isMyRedemptionsActive = matchPath({ path: "/redeem-points" }, endpoint);
    const myRedemptionsTab = <div className="leftNavMyRedemptionsTab">
        <PageButton text="Redeem Points" active={isMyRedemptionsActive} path="/redeem-points"/>
    </div>;

    const isMyEventsActive = matchPath({ path: "/my-events" }, endpoint);
    const myEventsTab = <div className="leftNavMyEventsTab">
        <PageButton text="My Events" active={isMyEventsActive} path="/my-events"/>
    </div>;

    return <div className={styles.leftNavLeftMiddle}>
        {homeTab}
        {pastTransactionsTab}
        {myRedemptionsTab}
        {myEventsTab}
    </div>;
}

function LeftBottom() {
    const { logout } = useAuth();
    return <div className={styles.leftNavLeftBottom}>
        <button className={styles.leftNavLogoutButton} onClick={logout}>
            Logout
        </button>
    </div>;
}

function LeftNav({ id }) {
    const location = useLocation();
    const endpoint = location.pathname.toLowerCase();
    return <div id={id} className="left-nav">
        <LeftTop />
        <LeftMiddle endpoint={endpoint} />
        <LeftBottom />
    </div>;
}

export default LeftNav;
