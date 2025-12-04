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
    return <RightSide />;
}

export default Profile;
