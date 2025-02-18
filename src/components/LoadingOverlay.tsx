import React from 'react';
import styles from './LoadingOverlay.module.css'; // Import a CSS module for styling

interface LoadingOverlayProps {
    isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
    if (!isLoading) {
        return null;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.spinner}>
                {/* Orbital rings with icons */}
                <div className={styles.orbit}>
                    <div className={styles.icon} />
                </div>
                <div className={styles.orbit}>
                    <div className={styles.icon} />
                </div>
                <div className={styles.orbit}>
                    <div className={styles.icon} />
                </div>
            </div>
            <p className={styles.loadingText}>Generating Reading...</p>
        </div>
    );
};

export default LoadingOverlay;