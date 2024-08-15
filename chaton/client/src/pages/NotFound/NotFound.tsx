import React from "react";
import styles from "./NotFound.module.css";

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.message}>Page Not Found</p>
    </div>
  );
};

export default NotFoundPage;
