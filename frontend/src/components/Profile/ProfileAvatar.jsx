import React from 'react';
import styles from './ProfileAvatar.module.css';

export default function ProfileAvatar({ src, alt = 'Profile Picture', size = 64, className = '' }) {
    const style = { width: `${size}px`, height: `${size}px` };
    return <img key={src || 'default'} src={src} alt={alt} className={`${styles.avatar} ${className}`} style={style} />;
}
