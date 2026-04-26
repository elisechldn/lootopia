import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    transports: [
        new transports.File({
            filename: 'logs/app.log',
            format: format.combine(
                format.timestamp(),
                format.label({ label: 'API' }),
                format.printf(({ timestamp, level, message, label }) => {
                    console.log(`${timestamp} [${level.toUpperCase()}] (${label}): ${message}`);
                    return `${timestamp} [${level.toUpperCase()}] (${label}): ${message}`;
                }),
            ),
        }),
        // new transports.Console({
        //     format: format.combine(
        //         format.timestamp(),
        //         format.printf(({ timestamp, level, message }) => {
        //             return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        //         }),
        //     ),
        // }), pour afficher les logs dans la console en plus du fichier (optionnel)
        // les logs de nest prennent déjà assez de place dans la console 
    ],

});



export function logInfo(level: string, message: string, label: string = 'API') {
    logger.log(level, message, {label});
}


