import { useNavigate } from "react-router-dom";
import styles from "./BackLinkButton.module.css";

export default function BackLinkButton({
    to = "/home",
    children = "< Back",
    onClick,
    className,
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
            className={className || styles.backLinkButton}
            onClick={handleClick}
        >
            {children}
        </button>
    );
}


