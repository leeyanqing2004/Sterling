import { useNavigate } from "react-router-dom";
import styles from "./BackLinkButton.module.css";

export default function BackLinkButton({
    to = "/home",
    children = "< Back",
    onClick,
}) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(to);
        }
    };

    return (
        <button
            type="button"
            className={styles.backLinkButton}
            onClick={handleClick}
        >
            {children}
        </button>
    );
}


