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

function LeftTop() {
    const { user } = useAuth();
    const name = user?.name;
    const utorid = user?.utorid;
    const role = user?.role;
    const profilePicture = <img src="/profile.png" alt="Profile Picture" />;
    const userInfo = <div className={styles.leftNavUserInfo}>
        <h1 className={styles.leftNavUsername}>{name}</h1>
        <div className={styles.leftNavUserDetails}>
            <p className={styles.leftNavUTORid}>{utorid}</p>
            <p className={styles.leftNavUserRole}>{role}</p>
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
    
    const isHomeActive = matchPath({ path: "/profile/:utorid/home" }, endpoint);
    const homeTab = <div className={styles.leftNavHomeTab}>
        <PageButton text="Home" active={isHomeActive} path={`/profile/${user.utorid}/home`}/>
    </div>;

    const isMyAccountActive = matchPath({ path: "/profile/:utorid/account" }, endpoint);
    const myAccountTab = <div className={styles.leftNavMyAccountTab}>
        <PageButton text="My Account" active={isMyAccountActive} path={`/profile/${user.utorid}/account`}/>
    </div>;

    const isTransferPointsActive = matchPath({ path: "/profile/:utorid/transfer-points" }, endpoint);
    const transferPointsTab = <div className={styles.leftNavTransferPointsTab}>
        <PageButton text="Transfer Points" active={isTransferPointsActive} path={`/profile/${user.utorid}/transfer-points`}/>
    </div>;

    const isRedeemPointsActive = matchPath({ path: "/profile/:utorid/redeem-points" }, endpoint);
    const redeemPointsTab = <div className={styles.leftNavRedeemPointsTab}>
        <PageButton text="Redeem Points" active={isRedeemPointsActive} path={`/profile/${user.utorid}/redeem-points`}/>
    </div>;

    const isPastTransactionsActive = matchPath({ path: "/profile/:utorid/past-transactions" }, endpoint);
    const pastTransactionsTab = <div className={styles.leftNavPastTransactionsTab}>
        <PageButton text="Past Transactions" active={isPastTransactionsActive} path={`/profile/${user.utorid}/past-transactions`}/>
    </div>;

    return <div className={styles.leftNavLeftMiddle}>
        {homeTab}
        {myAccountTab}
        {transferPointsTab}
        {redeemPointsTab}
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

function LeftNav({ id, className }) {
    const location = useLocation();
    const endpoint = location.pathname.toLowerCase();
    return <div id={id} className={`${styles.leftNav} ${className || ''}`}>
        <div className={styles.leftNavScrollableContent}>
            <Menu />
            <LeftTop />
            <LeftMiddle endpoint={endpoint} />
        </div>
        <LeftBottom />
    </div>;
}

export default LeftNav;