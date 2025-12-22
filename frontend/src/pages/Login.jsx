import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import LoginMainComponent from "../components/Login/LoginMainComponent.jsx";
import styles from "./Login.module.css"
import { useAuth } from '../contexts/AuthContext';

function Login() {

    const location = useLocation();
	const [pageType, setPageType] = useState(location.state?.pageType ?? "defaultLogin");
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <>
            <div className={styles.fullscreen}>
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
                <div className={styles.container}>
                    <img
                      src="/logo.svg"
                      alt="Sterling"
                      className={styles.loginLogo}
                    />
                    <LoginMainComponent pageType={pageType} setPageType={setPageType} />
                </div>
            </div>
        </>
    )
}

export default Login

// const [activeForm, setActiveForm] = useState("verify");

    // return <>
    //     <div className={`login-box ${activeForm === "login" ? "active" : ""}`} id="login-form">
    //     <h1>Welcome Back!</h1>
    //     <p>Enter your details to login to your account.</p>
    //         <form>
    //             <label htmlFor="email">Email</label>
    //             <input type="email" name="email" placeholder="Email" required/>
    //             <label htmlFor="password">Password</label>
    //             <input type="password" name="password" placeholder="Password" required/>
    //             <a href="#" onClick={() => setActiveForm("forgotpassword")}>Forgot Password?</a>
    //             <button type="submit" name="login">Sign In</button>
    //             <p>Don't have an account?{" "} <a href="#" onClick={() => setActiveForm("register")}>Register</a></p>
    //          </form>
    //     </div>

    //     <div className={`register-box ${activeForm === "register" ? "active" : ""}`} id="register-form">
    //     <h1>Hello there!</h1>
    //     <p>Sign up to continue to the loyalty points system.</p>
    //         <form onSubmit={(e) => {
    //             e.preventDefault();
    //             setActiveForm("emailsent");
    //         }}>
    //             <label htmlFor="name">Name</label>
    //             <input type="text" name="name" placeholder="Name" required/>
    //             <label htmlFor="utorid">Utorid</label>
    //             <input type="text" name="utorid" placeholder="Utorid" required/>
    //             <label htmlFor="email">Email</label>
    //             <input type="email" name="email" placeholder="Email" required/>
    //             <select name="role" required>
    //                 <option value="">Select Role</option>
    //                 <option value="user">User</option>
    //                 <option value="cashier">Cashier</option>
    //                 <option value="manager">Manager</option>
    //                 <option value="superuser">SuperUser</option>
    //             </select>
    //             <button type="submit" name="register">Register</button>
    //             <p>I do have an account!{" "} <a href="#" onClick={() => setActiveForm("login")}>Back to Login</a></p>
    //         </form>
    //     </div>

    //     <div className={`emailsent-box ${activeForm === "emailsent" ? "active" : ""}`} id="emailsent-page">
    //     <h1>Email sent!</h1>
    //     <p>An email has been sent to the email associated with your utorid. Please follow the instructions in the email to reset your password.</p>
    //         <form onSubmit={(e) => {
    //                 e.preventDefault();
    //                 setActiveForm("login");
    //             }}>
    //             <button type="submit" name="login">Back to Login</button>
    //         </form>
    //     </div>

    //     <div className={`forgotpassword-box ${activeForm === "forgotpassword" ? "active" : ""}`} id="forgotpassword-form">
    //     <h1>Forgot your password?</h1>
    //     <p>Please enter your utorid below.</p>
    //         <form>
    //             <label htmlFor="utorid">Utorid</label>
    //             <input type="text" name="utorid" placeholder="Utorid" required/>
    //             <button type="submit" name="getcode">Get Code</button>
    //             <a href="#" onClick={() => setActiveForm("login")}>Back to Login</a>
    //         </form>
    //     </div>

    //     <div className={`resetpassword-box ${activeForm === "resetpassword" ? "active" : ""}`} id="resetpassword-form">
    //     <h1>Reset password</h1>
    //     <p>Please set your new password.</p>
    //         <form onSubmit={(e) => {
    //                 e.preventDefault();
    //                 setActiveForm("passwordchanged");
    //             }}>
    //             <label htmlFor="newpassword">New Password</label>
    //             <input type="text" name="newpassword" placeholder="New Password" required/>
    //             <div name="password-requirements">
    //                 <ul>
    //                     <p>Your password must include:</p>
    //                     <li>8-20 characters</li>
    //                     <li>at least one uppercase letter</li>
    //                     <li>at least one lowercase letter</li>
    //                     <li>at least one number</li>
    //                     <li>at least one special character</li>
    //                 </ul>
    //             </div>
    //             <label htmlFor="confirmpassword">Confirm New Password</label>
    //             <input type="text" name="confirmpassword" placeholder="Confirm New Password" required/>
    //             <button type="submit" name="resetpassword">Submit</button>
    //         </form>
    //     </div>

    //     <div className={`passwordchanged-box ${activeForm === "passwordchanged" ? "active" : ""}`} id="passwordchanged-form">
    //     <h1>Password changed!</h1>
    //     <p>You have successfully reset your password.</p>
    //         <form onSubmit={(e) => {
    //                 e.preventDefault();
    //                 setActiveForm("login");
    //             }}>
    //             <button type="submit" name="loginnow">Login Now</button>
    //         </form>
    //     </div>

    //     <div className={`verify-form ${activeForm === "verify" ? "active" : ""}`} id="verify-form">
    //     <h1>Verify your identity</h1>
    //     <p>An account activation code has been sent to your email. Please enter your activation code below.</p>
    //         <form onSubmit={(e) => {
    //                 e.preventDefault();
    //                 setActiveForm("login");
    //             }}>
    //             <input type="text" name="activatecode"></input>
    //             <p>Do we need a timer here</p>
    //             <button type="submit" name="verify">Verify Code</button>
    //         </form>
    //     </div>
        
    // </>;