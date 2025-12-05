import OneInputComponent from "../InputForm/OneInputComponent.jsx";
import PrimaryButtonComponent from "../Buttons/PrimaryButtonComponent.jsx";
import PasswordRequirements from "../PasswordRequirements/PasswordRequirements.jsx"
import Error from "../ErrorMessage/ErrorMessage.jsx"
import styles from './LoginInputFieldsComponent.module.css';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function InputFields({ pageType, setPageType }){
    const navigate = useNavigate();
    const [inputName, setInputName] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [inputEmail, setInputEmail] = useState("");
    const [inputUtorid, setInputUtorid] = useState("");
    const [inputConfPassword, setInputConfPassword] = useState("");
    const [error, setError] = useState(null);
    const [loginSetPass, setLoginSetPass] = useState(false);

    // for setting and resetting password
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get("token");
    const setPassUtorid = searchParams.get("utorid");
    const fromCreate = searchParams.get("fromCreate") === "true";
    // const { resetToken } = useParams();
    const { user, login, logout, createAccount, sendResetPassEmail, setPassword } = useAuth();
    const username = user?.username;
    const utorid = user?.utorid;
    const handleSetPassword = (e) => {
        e.preventDefault();
        setError(null); // clear old errors

        if (!setPassUtorid || !resetToken) {
            return setError("Invalid reset link.");
        }

        if (inputPassword !== inputConfPassword) {
            return setError("'Password' and 'Confirm Password' must match.");
        }
        
        setPassword(setPassUtorid, inputPassword, resetToken)
        .then(message => {
            if (message) {
                setError(message);
            } else {
                setError(null);
                if (fromCreate) {
                    navigate("/login");
                }
            }
        });
    };

    switch (pageType){

        case "defaultLogin":
    
            const handleLogin = (e) => {
                e.preventDefault();
                login(inputUtorid, inputPassword)
                .then(message => setError(message));
            };

            return (
                <>
                    <form onSubmit={handleLogin}>
                        <OneInputComponent inputName="UTORid" inputType="text" required={true} onChange={(e) => setInputUtorid(e.target.value)}/>
                        <OneInputComponent inputName="Password" inputType="password" required={true} onChange={(e) => setInputPassword(e.target.value)}/>
                        {error && Error(error)}
                        <a id={styles.forgotpass} href="#" onClick={() => setPageType("forgotPassword")}>Forgot Password?</a>
                        <PrimaryButtonComponent type="submit">Sign In</PrimaryButtonComponent>
                        <p>Don't have an account?{" "} <a href="#" onClick={() => setPageType("createAccount")}>Register</a></p>
                    </form>
                </>
            );
        case "forgotPassword":

            const handleForgotPassword = (e) => {
                e.preventDefault();
                sendResetPassEmail(inputUtorid)
                .then(message => {
                    if (message) {
                        setError(message);
                    } else {
                        setError(null);
                        setLoginSetPass(true);
                    }
                });
            }
            return (
                <>
                    <form onSubmit={handleForgotPassword}>
                        <OneInputComponent inputName="UTORid" inputType="text" required={true} onChange={(e) => setInputUtorid(e.target.value)}/>
                        {error && Error(error)}
                        <PrimaryButtonComponent type="submit">Get Code</PrimaryButtonComponent>
                    </form>
                </>
            );
        case "resetPassword":

            return (
                <>
                    <form onSubmit={handleSetPassword}>
                        <OneInputComponent inputName="New password" inputType="password" required={true} onChange={(e) => setInputPassword(e.target.value)} />
                        <PasswordRequirements className={styles.passreq}/>
                        <OneInputComponent inputName="Confirm new password" inputType="password" required={true} onChange={(e) => setInputConfPassword(e.target.value)}/>
                        {error && Error(error)}
                        <PrimaryButtonComponent type="submit">Submit</PrimaryButtonComponent>
                    </form>
                </>
            );
        case "passwordChanged":
            return (
                <>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setPageType("defaultLogin");
                    }}>
                        <PrimaryButtonComponent type="submit">Login Now</PrimaryButtonComponent>
                    </form>
                </>
            );
        case "emailSent":
            return (
                <>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setPageType("defaultLogin");
                    }}>
                        <PrimaryButtonComponent type="submit">Back to Login</PrimaryButtonComponent>
                    </form>
                </>
            )
        case "createAccount":

            const handleCreateAccount = (e) => {
                e.preventDefault();
                createAccount(inputUtorid, inputName, inputEmail)
                .then(message => {
                    if (message) {
                        setError(message);
                    } else {
                        setError(null);
                        setLoginSetPass(true);
                    }
                });
            };

            return (
                <>
                    <form onSubmit={handleCreateAccount}>
                        <OneInputComponent inputName="Name" inputType="text" required={true} onChange={(e) => setInputName(e.target.value)}/>
                        <OneInputComponent inputName="UTORid" inputType="text" required={true} onChange={(e) => setInputUtorid(e.target.value)}/>
                        <OneInputComponent inputName="Email" inputType="email" required={true} onChange={(e) => setInputEmail(e.target.value)}/>
                        {error && Error(error)}
                        <PrimaryButtonComponent type="submit">Create Account</PrimaryButtonComponent>
                        <p>Already have an account?{" "} <a href="#" onClick={() => setPageType("defaultLogin")}>Login</a></p>
                    </form>
                </>
            );
        case "verifyIdentity":
            return (
                <>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setPageType("setPassword");
                    }}>
                        <OneInputComponent inputName={""} inputType="text" required={true} />
                        <PrimaryButtonComponent type="submit">Verify Code</PrimaryButtonComponent>
                    </form>
                </>
            );
        case "setPassword":
            return (
                <>
                    <form onSubmit={handleSetPassword}>
                        <OneInputComponent inputName="New password" inputType="password" required={true} onChange={(e) => setInputPassword(e.target.value)}/>
                        <PasswordRequirements className={styles.passreq}/>
                        <OneInputComponent inputName="Confirm new password" inputType="password" required={true} onChange={(e) => setInputConfPassword(e.target.value)}/>
                        {error && Error(error)}
                        <PrimaryButtonComponent type="submit">Create Account</PrimaryButtonComponent>
                    </form>
                </>
            );
    }
}