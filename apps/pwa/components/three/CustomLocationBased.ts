import * as THREE from 'three';
import * as LocAR from 'locar';

export type GpsUpdateEvent = {
  position: GeolocationPosition
  distMoved: number
}

export type CoordsPayload = {
  lat: number
  long: number
  accuracy: number
  distMoved: number
}

type GpsListenersCallbacks = {
  onError: (msg: string) => void
  onCoordsUpdate: (coords: CoordsPayload) => void
}

export type Coord = {
  lon: number;
  lat: number;
}

export class CustomLocationBased extends LocAR.LocationBased {

  public longitude: number;
  public latitude: number;
  public distMoved: number;
  public accuracy: number;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    super(scene, camera, {
      // gpsMinDistance : déplacement minimal en mètres entre deux updates GPS.
      // Évite le jitter des objets AR causé par la fluctuation GPS à l'arrêt.
      // En dessous de cette distance, la position caméra n'est PAS mise à jour.
      // Note : le premier update passe toujours (initialise l'origine du monde).
      gpsMinDistance: 10,

      // gpsMinAccuracy : précision maximale acceptée en mètres (rayon d'incertitude).
      // Un reading avec accuracy > cette valeur est rejeté silencieusement — gpsupdate
      // ne se déclenche pas du tout. À mettre assez haut en milieu urbain / intérieur
      // car la 5G et le Wi-Fi positioning retournent souvent 30–80 m d'accuracy.
      // Valeur par défaut LoCAR : 100 m.
      gpsMinAccuracy: 100,
    })
  }

  haversineDistance(pointA: Coord, pointB: Coord): number {
    const R = 6_371_000; // mètres (rayon moyen de la Terre).
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(pointB.lat - pointA.lat);
    const dLon = toRad(pointB.lon - pointA.lon);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(pointA.lat)) * Math.cos(toRad(pointB.lat)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance en mètres
  }

  onGpsError(callback: (code: number) => void) {
    this.on('gpserror', callback);
  }

  onGpsUpdate(callback: (ev: GpsUpdateEvent) => void) {
    this.on('gpsupdate', callback);
  }

  setupGpsListeners({ onError, onCoordsUpdate }: GpsListenersCallbacks) {
    this.onGpsError((code) => {
      console.log('code -> ', code)
      onError(`Erreur GPS (code ${code})`)
    })

    this.onGpsUpdate((ev: GpsUpdateEvent) => {
      const { longitude, latitude, accuracy } = ev.position.coords;
      const { distMoved } = ev;
      this.longitude = longitude;
      this.latitude = latitude;
      this.distMoved = distMoved;
      this.accuracy = accuracy;
      // Logguer distMoved à l'arrêt pour calibrer gpsMinDistance.
      // La valeur max observée sans bouger = bruit GPS → mettre gpsMinDistance légèrement au-dessus.
      // console.log('distMoved ->', distMoved)
      // alert(`distMoved ${distMoved}`)

      onCoordsUpdate({ lat: latitude, long: longitude, accuracy, distMoved });

    })
  }

  addTreeMesh() {

  }
}
