import { matchPath, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import PageButton from "./PageButton.jsx";
import styles from './LeftNav.module.css';
import ProfileAvatar from './ProfileAvatar.jsx';
import { Capitalize } from "../../utils/capitalize";

function LeftTop() {
    const { user } = useAuth();
    if (!user) return null;

    const name = user.name || "";
    const utorid = user.utorid || "";
    const role = user.role || "";
    const profilePicture = (
        <ProfileAvatar src={user?.avatarUrl || "/default-pfp.jpg"} alt="Profile Picture" size={64} />
    );
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
    const isMyRedemptionsActive = matchPath({ path: "/redeem-points" }, endpoint);
    const myRedemptionsTab = <div className="leftNavMyRedemptionsTab">
        <PageButton text="My Redemptions" active={isMyRedemptionsActive} path="/my-redemptions"/>
    </div>;

    const isMyEventsActive = matchPath({ path: "/my-events" }, endpoint);
    const myEventsTab = <div className="leftNavMyEventsTab">
        <PageButton text="My Events" active={isMyEventsActive} path="/my-events"/>
    </div>;

    const isMyRafflesActive = matchPath({ path: "/my-raffles" }, endpoint);
    const myRafflesTab = <div className="leftNavMyRafflesTab">
        <PageButton text="My Raffles" active={isMyRafflesActive} path="/my-raffles"/>
    </div>;

    return <div className={styles.leftNavLeftMiddle}>
        {myRedemptionsTab}
        {myEventsTab}
        {myRafflesTab}
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
