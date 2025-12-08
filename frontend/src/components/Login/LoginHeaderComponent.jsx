import styles from './LoginHeaderComponent.module.css';

export default function LoginHeader({ pageType }) {
    switch (pageType) {
        case "defaultLogin":
            return (
                <>
                    <div className={styles.container}>
                        <h1>Welcome Back!</h1>
                        <p>Enter your details to login to your Sterling account.</p>
                    </div>
                </>
            );
        case "forgotPassword":
            return (
                <>
                    <div className={styles.container}>
                        <h1>Forgot your password?</h1>
                        <p>Please enter your email below.</p>
                    </div>
                </>
            );
        case "resetPassword":
            return (
                <>
                    <div className={styles.container}>
                        <h1>Reset password</h1>
                        <p>Please set your new password.</p>
                    </div>
                </>
            );
        case "passwordChanged":
            return (
                <>
                    <div className={styles.container}>
                        <h1>Password changed!</h1>
                        <p>You have successfully reset your password.</p>
                    </div>
                </>
            );
        case "emailSent":
            return (
                <>
                    <div className={styles.container}>
                        <h1>Email sent!</h1>
                        <p>An email has been sent to the email associated with your utorid. Please follow the instructions in the email to reset your password.</p>
                    </div>
                </>
            );
        case "createAccount":
            return (
                <>
                    <div className={styles.container}>
                        <h1>Hello there!</h1>
                        <p>Sign up to continue to the loyalty points system.</p>
                    </div>
                </>
            );
        case "verifyIdentity":
            return (
                <>
                    <div className={styles.container}>
                        <h1>Verify your identity</h1>
                        <p>An account activation code has been sent to your email. Please enter your activation code below.</p>
                    </div>
                </>
            );
        case "setPassword":
            return (
                <>
                    <div className={styles.container}>
                        <h1>Set Password</h1>
                        <p>Please set your password.</p>
                    </div>
                </>
            );
    }
}