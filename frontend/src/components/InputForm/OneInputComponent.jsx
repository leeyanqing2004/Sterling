import styles from './OneInputComponent.module.css';

export default function OneInput({ inputName, inputType, required, onChange, hasError = false }) {
    return ( 
        <>
            <div className={styles.container}>
                <label htmlFor={inputName.replace(/\s+/g, "-").toLowerCase()}>{inputName}</label>
                <input
                    id={inputName.replace(/\s+/g, "-").toLowerCase()}
                    type={inputType}
                    required={required}
                    onChange={onChange}
                    className={hasError ? styles.errorInput : ""}
                />
            </div>
        </>
    )
}
