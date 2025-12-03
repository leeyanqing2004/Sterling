import { useNavigate } from "react-router-dom";
import styles from './PageButton.module.css';

function PageButton({ text, active, path }) {
    const navigate = useNavigate();
    const activeClass = active ? styles.pageButtonActive : "";
    return (
        <button
            className={`${styles.pageButton} ${activeClass}`}
            onClick={() => navigate(path)}
        >
            {text}
        </button>
    );
}

export default PageButton;