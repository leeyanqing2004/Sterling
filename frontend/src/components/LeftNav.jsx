import PageButton from "./PageButton.jsx";
import './LeftNav.css';

function Menu() {
    return <button className="left-nav-menu">
        <span className="left-nav-menu-bar"></span>
        <span className="left-nav-menu-bar"></span>
        <span className="left-nav-menu-bar"></span>
    </button>
}

function LeftTop() {
    const profilePicture = <img src="/profile.png" alt="Profile Picture" />;
    const userInfo = <div className="left-nav-user-info">
        <h1 className="left-nav-username">John Doe</h1>
        <div className="left-nav-user-details">
            <p className="left-nav-UTORid">1234567890</p>
            <p className="left-nav-user-role">Regular User</p>
        </div>
    </div>;

    return <div className="left-nav-left-top">
        {profilePicture}
        {userInfo}
    </div>;
}

function LeftMiddle() {
    const homeTab = <div className="left-nav-home-tab">
        {PageButton({text: "Home"})}
    </div>;

    const myAccountTab = <div className="left-nav-my-account-tab">
        {PageButton({text: "My Account"})}
    </div>;

    const transferPointsTab = <div className="left-nav-transfer-points-tab">
        {PageButton({text: "Transfer Points"})}
    </div>;

    const redeemPointsTab = <div className="left-nav-redeem-points-tab">
        {PageButton({text: "Redeem Points"})}
    </div>;

    const pastTransactionsTab = <div className="left-nav-past-transactions-tab">
        {PageButton({text: "Past Transactions"})}
    </div>;

    return <div className="left-nav-left-middle">
        {homeTab}
        {myAccountTab}
        {transferPointsTab}
        {redeemPointsTab}
        {pastTransactionsTab}
    </div>;
}

function LeftBottom() {
    return <div className="left-nav-left-bottom">
        <button className="left-nav-logout-button">
            Logout
        </button>
    </div>;
}

function LeftNav({ id }) {
    return <div id={id} className="left-nav">
        {Menu()}
        {LeftTop()}
        {LeftMiddle()}
        {LeftBottom()}
    </div>;
}

export default LeftNav;