import "./AccountSection.css";

function AccountInfo({ label, value }) {
    return <div className="account-section-account-info">
        <p className="account-section-account-info-label">{label}</p>
        <p className="account-section-account-info-value">{value}</p>
    </div>;
}

function AccountSection({ id }) {
    return  <div id={id} className="account-section">
                <div className="account-section-details">
                    <div className="account-section-settings">
                        <h2 className="account-sectoon-title">Account Details</h2>
                        {AccountInfo({label: "UTORid", value: "1234567890"})}
                        {AccountInfo({label: "Role", value: "Regular User"})}
                        {AccountInfo({label: "Member Since", value: "February 24, 2024"})}
                        {AccountInfo({label: "Status", value: "Not Verified"})}
                    </div>
                </div>
            </div>;
}

export default AccountSection;