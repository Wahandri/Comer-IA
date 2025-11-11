import Link from "next/link";
import styles from "./DevBadge.module.css";

/**
 * DevBadge
 * - Muestra tu logo + texto "Desarrollado por Wahandri"
 * - El logo gira 360º en hover
 * - Al pasar hover aparece el texto con enlace a tu portfolio
 */
export default function DevBadge({
  portfolioUrl = "https://wahandri.github.io",
  name = "Wahandri",
  fixedTopRight = false,
  compact = false,
}) {
  return (
    <div
      className={`${styles.badge} ${
        fixedTopRight ? styles.fixedTopRight : ""
      } ${compact ? styles.compact : ""}`}
      aria-label={`Desarrollado por ${name}`}
      title={`Desarrollado por ${name}`}
    >
      {/* Logo desde /public/logo.png */}
      <div className={styles.logo} aria-hidden="true">
        <img src="/logotipo.png" alt={`Logo ${name}`} className={styles.imgLogo} />
      </div>

      <div className={styles.textWrap}>
        <span className={styles.textLabel}>Desarrollado por&nbsp;</span>
        <Link
          href={portfolioUrl}
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </Link>
      </div>
    </div>
  );
}
