import "./AccountSection.css";

function AccountSection({ id }) {
    return <div id={id} className="account-section">
                <div className="account-details">
                    <div className="profile-settings">
                        <h2>Account Details</h2>
                        <div className="UTORid">
                            <p>UTORid</p>
                            <p>1234567890</p>
                        </div>
                        <div className="role">
                            <p>Role</p>
                            <p>Regular User</p>
                        </div>
                        <div className="member-since">
                            <p>Member Since</p>
                            <p>February 24, 2024</p>
                        </div>
                        <div className="status">
                            <p>Status</p>
                            <p>Not Verified</p>
                        </div>
                    </div>
                </div>
    </div>;
}

export default AccountSection;