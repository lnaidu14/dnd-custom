import styles from './Error.module.css';

export default function Error({ message }) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>⚠️</div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}