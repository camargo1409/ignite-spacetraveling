import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  // TODO
  return(
    <header className={styles.container}>
      <div>
        <Link href="/">
          <img src="/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  )
}
