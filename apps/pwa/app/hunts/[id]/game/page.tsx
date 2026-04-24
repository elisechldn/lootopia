'use client';

import {useEffect} from "react";

/**
 * Just for testing
 */
export default function Page() {

    const handleCLick = () => {
        if (!("geolocation" in navigator)) throw new Error('Pas de géolocalisation');

        /// Vérifier l'état de la permission AVANT de demander
        navigator.permissions.query({ name: "geolocation" }).then(result => {

            console.log("Permission state:", result.state); // "granted" | "denied" | "prompt"
        });

        const options = {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0,
        };

        const success = (e: GeolocationPosition) => {
            console.log('SUCCESS ==> ', e);
        };

        const error = (err: GeolocationPositionError) => {
            console.log('ERROR ==> ', err);
        };

        const currentPosition = navigator.geolocation.getCurrentPosition(success, error, options);
    }


    return <div className={'w-full'}>
        <button className={'p-10 bg-violet-500 rounded-3xl '} onClick={handleCLick}>GEOLOCALISATION</button>
    </div>
}