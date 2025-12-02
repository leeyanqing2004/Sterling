import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import ProfileSection from "../components/Profile/ProfileSection";
import AccountSection from "../components/Profile/AccountSection";
import styles from "./Profile.module.css";

function RightSide() {
    return <div className={styles.profileRightSide}>
        <ProfileSection className={styles.profileProfileSection}/>
        <AccountSection className={styles.profileAccountSection}/>
    </div>
}

function Profile() {
    return <div className={styles.profilePageContainer}>
        <Nav className={styles.profileNav} />
        <div className={styles.profileLeftNavAndContentContainer}>
            <LeftNav className={styles.profileLeftNavContainer} />
            <div className={styles.profileContentContainer}>
                <RightSide />
            </div>
        </div>
    </div>;
}

export default Profile;