import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p>Chargement de la carte...</p>
})

export function HuntMap() {
    return <Map />
}