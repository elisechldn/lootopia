'use client'

import { useState } from 'react'
import styles from './TabNavigation.module.css'

const TABS = [
  { label: 'Accueil' },
  { label: 'Carte' },
  { label: 'AR' },
  { label: 'Profil' },
]

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <nav className={styles.tabBar}>
      {TABS.map((tab, index) => (
        <button
          key={tab.label}
          className={`${styles.tab} ${activeTab === index ? styles.active : ''}`}
          onClick={() => setActiveTab(index)}
          aria-label={tab.label}
        >
          <span className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
