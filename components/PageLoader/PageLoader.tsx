import { Clock8 } from "lucide-react"
import styles from "./PageLoader.module.css"

export default function PageLoader() {
  return (
    <div role="status" aria-label="Loading" className={styles.loader}>
      <Clock8 className={styles.spinner} size={40} strokeWidth={1.5} />
    </div>
  )
}
