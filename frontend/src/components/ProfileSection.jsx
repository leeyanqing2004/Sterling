import "./ProfileSection.css";

function ProfileField({ type, label }) {
    return  <div className="profile-field">
                <label className="profile-field-label" htmlFor={label}>{label}</label>
                <input className="profile-field-input" type={type} id={label} name={label} />
            </div>;
}

function ProfileSection({ id }) {
    return  <div id={id} className="profile-section">
                <div className="profile-container">
                    <h2 className="my-profile">My Profile</h2>
                    <div className="image-settings">
                        <img src="/profile.png" alt="Profile Picture" />
                        <button className="new-image-button">Upload New Image</button>
                        <button className="remove-image-button">Remove Image</button>
                    </div>
                    <div className="public-settings">
                        <ProfileField type="text" label="Name" />
                        <ProfileField type="date" label="Birthday" />
                    </div>
                    <h2 className="account-security">Account Security</h2>
                    <div className="private-settings">
                        <ProfileField type="email" label="Email" />
                        <ProfileField type="password" label="Password" />
                        <button className="change-password-button">Change Password</button>
                    </div>
                    <button className="button-edit">Edit</button>
                </div>
            </div>;
}

export default ProfileSection;