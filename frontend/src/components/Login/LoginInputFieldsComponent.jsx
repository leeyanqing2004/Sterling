import OneInputComponent from "../InputForm/OneInputComponent.jsx";
import PrimaryButtonComponent from "../Buttons/PrimaryButtonComponent.jsx";
import PasswordRequirements from "../PasswordRequirements/PasswordRequirements.jsx";
import styles from './LoginInputFieldsComponent.module.css';

export default function InputFields({ pageType, setPageType }){
    switch (pageType){
        case "defaultLogin":
            return (
                <>
                    <form>
                        <OneInputComponent inputName="Email" inputType="email" required={true} />
                        <OneInputComponent inputName="Password" inputType="password" required={true} />
                        <a id={styles.forgotpass} href="#" onClick={() => setPageType("forgotPassword")}>Forgot Password?</a>
                        <PrimaryButtonComponent type="submit">Sign In</PrimaryButtonComponent>
                        <p>Don't have an account?{" "} <a href="#" onClick={() => setPageType("createAccount")}>Register</a></p>
                    </form>
                </>
            );
        case "forgotPassword":
            return (
                <>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setPageType("emailSent");
                    }}>
                        <OneInputComponent inputName="Utorid" inputType="text" required={true} />
                        <PrimaryButtonComponent type="submit">Get Code</PrimaryButtonComponent>
                    </form>
                </>
            );
        case "resetPassword":
            return (
                <>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setPageType("passwordChanged");
                    }}>
                        <OneInputComponent inputName="New password" inputType="password" required={true} />
                        <PasswordRequirements className={styles.passreq}/>
                        <OneInputComponent inputName="Confirm new password" inputType="password" required={true} />
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
            return (
                <>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setPageType("verifyIdentity");
                    }}>
                        <OneInputComponent inputName="Name" inputType="text" required={true} />
                        <OneInputComponent inputName="Utorid" inputType="text" required={true} />
                        <OneInputComponent inputName="Email" inputType="email" required={true} />
                        <PrimaryButtonComponent type="submit">Create Account</PrimaryButtonComponent>
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
        case "setPassword": //TODO: where does setPassword lead to?
            return (
                <>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setPageType("passwordChanged");
                    }}>
                        <OneInputComponent inputName="New password" inputType="password" required={true} />
                        <PasswordRequirements className={styles.passreq}/>
                        <OneInputComponent inputName="Confirm new password" inputType="password" required={true} />
                        <PrimaryButtonComponent type="submit">Create Account</PrimaryButtonComponent>
                    </form>
                </>
            );
    }
}