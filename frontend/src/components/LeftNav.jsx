import PageButton from "./PageButton.jsx";
import './LeftNav.css';

function Menu() {
    return  <button className="menu">
                <span className="menu-bar"></span>
                <span className="menu-bar"></span>
                <span className="menu-bar"></span>
            </button>
}

function LeftTop() {
    const profilePicture = <img src="/profile.png" alt="Profile Picture" />;
    const userInfo = <div className="user-info">
        <h1>John Doe</h1>
        <div className="user-details">
            <p className="UTORid">1234567890</p>
            <p className="user-role">Regular User</p>
        </div>
    </div>;

    return <div className="left-top">
        {profilePicture}
        {userInfo}
    </div>;
}

function LeftMiddle() {
    const homeTab = <div className="home-tab">
        {PageButton({text: "Home"})}
    </div>;

    const myAccountTab = <div className="my-account-tab">
        {PageButton({text: "My Account"})}
    </div>;

    const transferPointsTab = <div className="transfer-points-tab">
        {PageButton({text: "Transfer Points"})}
    </div>;

    const redeemPointsTab = <div className="redeem-points-tab">
        {PageButton({text: "Redeem Points"})}
    </div>;

    const pastTransactionsTab = <div className="past-transactions-tab">
        {PageButton({text: "Past Transactions"})}
    </div>;

    return <div className="left-middle">
        {homeTab}
        {myAccountTab}
        {transferPointsTab}
        {redeemPointsTab}
        {pastTransactionsTab}
    </div>;
}

function LeftBottom() {
    return <div className="left-bottom">
        <button className="logout-button">
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