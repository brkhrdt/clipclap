import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    // level: 'info',
    level: 'debug',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'combined.log' }),
    ],
});

export default logger;
