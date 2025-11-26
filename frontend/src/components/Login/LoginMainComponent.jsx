import LoginHeaderComponent from "./LoginHeaderComponent.jsx";
import LoginInputFieldsComponent from "./LoginInputFieldsComponent.jsx";
import styles from "./LoginMainComponent.module.css";

export default function MainComponent({ pageType, setPageType }) {
    return (
        <>
            <div className={styles.container}>
                <LoginHeaderComponent pageType={pageType} />
                <LoginInputFieldsComponent pageType={pageType} setPageType={setPageType} />
            </div>
        </>
    )
}