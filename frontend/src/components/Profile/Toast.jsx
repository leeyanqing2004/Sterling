import React, { useEffect } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return;
        const id = setTimeout(() => onClose && onClose(), duration);
        return () => clearTimeout(id);
    }, [message, duration, onClose]);

    if (!message) return null;
    const cls = `${styles.toast} ${type === 'error' ? styles.toastError : styles.toastSuccess}`;
    return (
        <div className={styles.toastContainer}>
            <div className={cls} role="status">
                <div className={styles.toastMessage}>{message}</div>
            </div>
        </div>
    );
}
