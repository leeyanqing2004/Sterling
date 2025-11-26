import styles from './OneInputComponent.module.css';

export default function OneInput({ inputName, inputType, required }) {
    return ( 
        <>
            <div className={styles.container}>
                <label htmlFor={inputName.replace(/\s+/g, "-").toLowerCase()}>{inputName}</label>
                <input id={inputName.replace(/\s+/g, "-").toLowerCase()} type={inputType} required={required} />
            </div>
        </>
    )
}