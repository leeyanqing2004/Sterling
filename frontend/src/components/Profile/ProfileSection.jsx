import { useMatch, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { supabase } from "../../api/supabaseClient";
import ProfileAvatar from "./ProfileAvatar.jsx";
import api from "../../api/api";
import RedeemPointsPopup from "../Popups/RedeemPointsPopup";
import TransferPointsPopup from "../Popups/TransferPoints";
import Toast from "./Toast.jsx";
import styles from "./ProfileSection.module.css";

function isValidName(name) {
    return name && 1 <= name.length && name.length <= 50;
}

function isValidEmail(email) {
    return email && email.endsWith("mail.utoronto.ca");
}

function isValidBirthday(birthday) {
    if (!birthday) {
        return false;
    }

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(birthday)) {
        return false;
    }

    const [year, month, day] = birthday.split("-").map(Number);
    const date = new Date(year, month, day);
    const today = new Date();
    if (date > today) {
        return false;
    }

    return date.getFullYear() === year && (date.getMonth()) === month && date.getDate() === day;
}

function ProfileField({ type, label, field, setField, error }) {
    return  <div className={styles.profileSectionProfileField}>
        <label className={styles.profileSectionProfileFieldLabel} htmlFor={label}>{label}</label>
        <input className={styles.profileSectionProfileFieldInput} 
               type={type} 
               id={label} 
               name={label} 
               value={field} 
               onChange={(e) => setField(e.target.value)} 
        />
        {error && <span className={styles.profileSectionError}>{error}</span>}
    </div>;
}


function ProfileSection({ id, className }) {
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState("");
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [locked, setLocked] = useState(true);

    const [nameError, setNameError] = useState("");
    const [birthdayError, setBirthdayError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "success" });
    // Preview avatar changes locally until saved
    const [pendingAvatarUrl, setPendingAvatarUrl] = useState(undefined);
    const navigate = useNavigate();
    const { utorid } = useParams();
    const { user, updateUser } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    
    const isRedeemRoute = Boolean(useMatch("/redeem-points"));
    const isTransferRoute = Boolean(useMatch("/transfer-points"));

    // Load existing user data when component mounts or user changes
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setBirthday(user.birthday || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const profileSectionSettingsStyle = locked ? styles.profileSectionSettingsLocked : styles.profileSectionSettingsUnlocked;
    const profileSectionNewImageButtonStyle = locked ? "" : styles.profileSectionNewImageButtonUnlocked;
    const profileSectionRemoveImageButtonStyle = locked ? "" : styles.profileSectionRemoveImageButtonUnlocked;
    const profileSectionChangePasswordButtonStyle = locked ? "" : styles.profileSectionChangePasswordButtonUnlocked;

    const handleCancelChanges = () => {
        // Reset to original user data
        setName(user?.name || "");
        setBirthday(user?.birthday || "");
        setEmail(user?.email || "");
        setOldPassword("");
        setNewPassword("");
        setLocked(true);

        setNameError("");
        setBirthdayError("");
        setEmailError("");
        setPasswordError("");
        // discard any pending avatar change
        setPendingAvatarUrl(undefined);
    }

    const handleCloseRedeem = () => {
        if (utorid) {
            navigate(`/dashboard`);
        } else {
            navigate("/profile");
        }
    };

        const handleCloseTransfer = () => {
        if (utorid) {
            navigate(`/dashboard`);
        } else {
            navigate("/profile");
        }
    };


    const handleSaveChanges = async () => {
        setNameError("");
        setBirthdayError("");
        setEmailError("");

        let containsErrors = false;
        if (name && !isValidName(name)) {
            setNameError("Name must be between 1 and 50 characters.");
            containsErrors = true;
        }

        if (birthday && !isValidBirthday(birthday)) {
            setBirthdayError("Birthday must be a valid date in the format YYYY-MM-DD.");
            containsErrors = true;
        }

        if (email && !isValidEmail(email)) {
            setEmailError("Email must be a valid University of Toronto email address.");
            containsErrors = true;
        }

        if (containsErrors) {
            return;
        }

        try {
            let update = {};
            if (name) {
                update.name = name;
            }

            if (birthday) {
                update.birthday = birthday;
            }

            if (email) {
                update.email = email;
            }

            // Include avatar only if a change was made in this session
            if (pendingAvatarUrl !== undefined) {
                update.avatarUrl = pendingAvatarUrl;
            }

            if (Object.keys(update).length > 0) {
                await api.patch('/users/me', update);
                setToast({ message: "Profile updated successfully.", type: "success" });
                
                // Update user context with all saved values
                const userUpdates = {};
                if (update.name !== undefined) {
                    userUpdates.name = update.name;
                }
                if (update.birthday !== undefined) {
                    userUpdates.birthday = update.birthday;
                }
                if (update.email !== undefined) {
                    userUpdates.email = update.email;
                }
                if (pendingAvatarUrl !== undefined) {
                    userUpdates.avatarUrl = pendingAvatarUrl;
                    setPendingAvatarUrl(undefined);
                }
                
                if (Object.keys(userUpdates).length > 0) {
                    updateUser(userUpdates);
                }
            }

            setLocked(true);
        } catch (error) {
            const err = error.response.data.error;
            const errLower = err.toLowerCase();
            if (errLower.includes("name")) {
                setNameError(err);
            } else if (errLower.includes("birthday")) {
                setBirthdayError(err);
            } else if (errLower.includes("email")) {
                setEmailError(err);
            } else {
                alert(err);
            }
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError("");
        if (oldPassword === "" || newPassword === "") {
            setPasswordError("Please fill in both the old and new password fields.");
            return;
        }

        try {
            await api.patch('/users/me/password', {
                old: oldPassword,
                new: newPassword
            });

            setOldPassword("");
            setNewPassword("");
            alert("Password changed successfully.");
        } catch (error) {
            const err = error.response.data.error;
            setPasswordError(err);
        }
    }

    // Handle profile image upload
    const handleImageUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            // Create a unique file name using the user's utorid
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.utorid}_avatar.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type || 'image/jpeg',
                    cacheControl: '3600'
                });
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;
            const publicUrlWithTime = `${publicUrl}?t=${new Date().getTime()}`;
            // preview only; commit on Save Changes
            setPendingAvatarUrl(publicUrlWithTime);
        } catch (error) {
            console.error(error);
            setToast({ message: "Error uploading profile picture.", type: "error" });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        // Set preview to default; commit on Save Changes
        setPendingAvatarUrl('/default-pfp.jpg');
    };

    return <div id={id} className={`${styles.profileSection} ${className || ''}`}>
        <div className={styles.profileSectionDetails}>
            <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>My Profile</h2>
                <div className={styles.profileSectionHeaderActions}>
                    <button
                        type="button"
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        )}
                    </button>
                    {locked && (
                        <button className={styles.profileSectionEditButton} onClick={() => setLocked(false)}>
                            Edit
                        </button>
                    )}
                </div>
            </div>
            <div className={`${styles.profileSectionSettings} ${profileSectionSettingsStyle}`}>
                <div className={styles.profileSectionImageSettings}>
                    <ProfileAvatar
                            src={(pendingAvatarUrl !== undefined ? pendingAvatarUrl : user?.avatarUrl) || "/default-pfp.jpg"}
                            alt="Profile Picture"
                            size={80}
                        />
                    <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading || locked} // Disable if uploading OR if profile is locked
                        style={{ display: 'none' }} 
                    />
                    <div className={styles.profileSectionImageButtons}>
                        <label 
                            htmlFor="avatar-upload"
                            className={`${styles.profileSectionNewImageButton} ${profileSectionNewImageButtonStyle}`}
                        >
                            {uploading ? "Uploading..." : "Upload New Image"}
                        </label>
                        <button 
                            className={`${styles.profileSectionRemoveImageButton} ${profileSectionRemoveImageButtonStyle}`}
                            onClick={handleRemoveImage}
                            disabled={locked || uploading}
                        >
                            Remove Image
                        </button>
                    </div>
                </div>

                
                <div className={styles.profileSectionPublicSettings}>
                    <ProfileField type="text" label="Name" field={name} setField={setName} error={nameError} />
                    <ProfileField type="date" label="Birthday" field={birthday} setField={setBirthday} error={birthdayError}/>
                </div>
                <h2 className={styles.profileSectionAccountSecurity}>Account Security</h2>
                <div className={styles.profileSectionPrivateSettings}>
                    <ProfileField type="email" label="Email" field={email} setField={setEmail} error={emailError} />
                    <ProfileField type="password" label="Old Password" field={oldPassword} setField={setOldPassword} />
                    <ProfileField type="password" label="New Password" field={newPassword} setField={setNewPassword} />
                    {passwordError && <span className={styles.profileSectionError}>{passwordError}</span>}
                    <div className={styles.profileSectionPassword}>
                        <button 
                            className={`${styles.profileSectionChangePasswordButton} ${profileSectionChangePasswordButtonStyle}`} 
                            onClick={handlePasswordChange}>
                                Change Password
                        </button>
                    </div>
                </div>
            </div>
            {!locked && (
                <div className={styles.profileSectionEditingFields}>
                    <div className={styles.profileSectionEditingButtons}>
                        <button className={styles.profileSectionDiscardChangesButton} onClick={handleCancelChanges}>Cancel</button>
                        <button className={styles.profileSectionSaveChangesButton} onClick={handleSaveChanges}>Save Changes</button>
                    </div>
                </div>
            )}
            {isRedeemRoute && <RedeemPointsPopup onClose={handleCloseRedeem} />}
            {isTransferRoute && <TransferPointsPopup onClose={handleCloseTransfer} />}
        </div>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: toast.type })} />
    </div>;
}

export default ProfileSection;
