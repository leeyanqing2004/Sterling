import { useState } from "react";
import { useLocation } from "react-router-dom";
import LoginMainComponent from "../components/Login/LoginMainComponent.jsx";
import styles from "./Login.module.css"
import { useAuth } from '../contexts/AuthContext';

function ResetPassword() {

    // const location = useLocation();
	const [pageType, setPageType] = useState("resetPassword");

    return (
        <>
            <div className={styles.fullscreen}>
                <div className={styles.container}>
                    <LoginMainComponent pageType={pageType} setPageType={setPageType} />
                </div>
            </div>
        </>
    )
}

export default ResetPassword