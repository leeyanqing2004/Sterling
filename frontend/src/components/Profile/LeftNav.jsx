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
    const name = user?.name;
    const utorid = user?.utorid;
    const role = user?.role;
    const profilePicture = <img src="/profile.png" alt="Profile Picture" />;
<<<<<<< HEAD
    const userInfo = <div className="left-nav-user-info">
        <h1 className="left-nav-username">{name}</h1>
        <div className="left-nav-user-details">
            <p className="left-nav-UTORid">{utorid}</p>
            <p className="left-nav-user-role">{Capitalize(role)}</p>
=======
    const userInfo = <div className={styles.leftNavUserInfo}>
        <h1 className={styles.leftNavUsername}>{name}</h1>
        <div className={styles.leftNavUserDetails}>
            <p className={styles.leftNavUTORid}>{utorid}</p>
            <p className={styles.leftNavUserRole}>{role}</p>
>>>>>>> origin/main
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
<<<<<<< HEAD
    const isHomeActive = matchPath({ path: "/profile/:utorid/home" }, endpoint) || matchPath({ path: "/home" }, endpoint);
    const homeTab = <div className="left-nav-home-tab">
        <PageButton text="Home" active={isHomeActive} path="/home"/>
=======
    
    const isHomeActive = matchPath({ path: "/home" }, endpoint);
    const homeTab = <div className={styles.leftNavHomeTab}>
        <PageButton text="Home" active={isHomeActive} path={"/home"}/>
>>>>>>> origin/main
    </div>;

    const isMyAccountActive = matchPath({ path: "/profile" }, endpoint);
    const myAccountTab = <div className={styles.leftNavMyAccountTab}>
        <PageButton text="My Account" active={isMyAccountActive} path={"/profile"}/>
    </div>;

<<<<<<< HEAD
    const isPastTransactionsActive = matchPath({ path: "/past-transactions" }, endpoint);
    const pastTransactionsTab = <div className="left-nav-past-transactions-tab">
        <PageButton text="Past Transactions" active={isPastTransactionsActive} path={`/past-transactions`}/>
=======
    const isTransferPointsActive = matchPath({ path: "/transfer-points" }, endpoint);
    const transferPointsTab = <div className={styles.leftNavTransferPointsTab}>
        <PageButton text="Transfer Points" active={isTransferPointsActive} path={"/transfer-points"}/>
    </div>;

    const isRedeemPointsActive = matchPath({ path: "/redeem-points" }, endpoint);
    const redeemPointsTab = <div className={styles.leftNavRedeemPointsTab}>
        <PageButton text="Redeem Points" active={isRedeemPointsActive} path={"/redeem-points"}/>
    </div>;

    const isPastTransactionsActive = matchPath({ path: "/past-transactions" }, endpoint);
    const pastTransactionsTab = <div className={styles.leftNavPastTransactionsTab}>
        <PageButton text="Past Transactions" active={isPastTransactionsActive} path={"/past-transactions"}/>
>>>>>>> origin/main
    </div>;

    return <div className={styles.leftNavLeftMiddle}>
        {homeTab}
        {myAccountTab}
        {pastTransactionsTab}
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
<<<<<<< HEAD
    return <div id={id} className="left-nav">
        <LeftTop />
        <LeftMiddle endpoint={endpoint} />
=======
    return <div id={id} className={styles.leftNav}>
        <div className={styles.leftNavScrollableContent}>
            <Menu />
            <LeftTop />
            <LeftMiddle endpoint={endpoint} />
        </div>
>>>>>>> origin/main
        <LeftBottom />
    </div>;
}

export default LeftNav;
