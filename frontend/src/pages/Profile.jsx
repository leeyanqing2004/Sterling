import Nav from "../components/Nav";
import LeftNav from "../components/LeftNav";
import ProfileSection from "../components/ProfileSection";
import AccountSection from "../components/AccountSection";
import "./Profile.css";

function RightSide() {
    return <div id="profile-right-side">
        <ProfileSection id="profile-profile-section"/>
        <AccountSection id="profile-account-section"/>
    </div>
}

function Profile() {
    return <div id="profile-grid-container">
        <Nav id="profile-nav"/>
        <LeftNav id="profile-left-nav"/>
        <RightSide />
    </div>;
}

export default Profile;