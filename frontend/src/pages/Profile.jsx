import Nav from "../components/Nav";
import LeftNav from "../components/LeftNav";
import ProfileSection from "../components/ProfileSection";
import AccountSection from "../components/AccountSection";
import "./Profile.css";

function Profile() {
    return <div id="grid-container">
        <Nav id="nav"/>
        <LeftNav id="left-nav"/>
        <div id="account-info">
            <ProfileSection id="profile-section"/>
            <AccountSection id="account-section"/>
        </div>
    </div>;
}

export default Profile;