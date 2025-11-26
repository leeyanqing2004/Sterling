import "./ProfileSection.css";

function ProfileField({ type, label }) {
    return  <div className="profile-field">
                <label htmlFor={label}>{label}</label>
                <input type={type} id={label} name={label} />
            </div>;
}

function ProfileSection({ id }) {
    return  <div id={id} className="profile-section">
                <div className="profile-details">
                    <div className="public-settings">
                        <h2>My Profile</h2>
                        <img src="/profile.png" alt="Profile Picture" />
                        <button className="new-image-button">Upload New Image</button>
                        <button className="remove-image-button">Remove Image</button>
                        <ProfileField type="text" label="Name" />
                        <ProfileField type="date" label="Birthday" />
                    </div>
                    <div className="private-settings">
                        <h2>Account Security</h2>
                        <ProfileField type="email" label="Email" />
                        <ProfileField type="password" label="Password" />
                        <button className="change-password-button">Change Password</button>
                    </div>
                    <button className="button-edit">Edit</button>
                </div>
            </div>;
}

export default ProfileSection;