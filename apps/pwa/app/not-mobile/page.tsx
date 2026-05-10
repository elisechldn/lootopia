export default function NotMobilePage() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
        Application mobile uniquement
      </h1>
      <p style={{ fontSize: '16px', color: '#666', maxWidth: '400px' }}>
        Lootopia est conçu pour les appareils mobiles. Veuillez ouvrir cette
        application sur votre smartphone ou tablette.
      </p>
    </main>
  )
}
