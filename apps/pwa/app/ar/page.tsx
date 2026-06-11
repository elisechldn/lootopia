//import ARScene from '../../components/ar/ARScene'

const FAKE_GPS = process.env.NEXT_PUBLIC_AR_FAKE_GPS === 'true'

export default function ARPage() {
  return (
    <p>HOLA</p>
    /*<ARScene
      useFakeGps={FAKE_GPS}
      fakeLon={2.3488}
      fakeLat={48.8534}
    />*/
  )
}
