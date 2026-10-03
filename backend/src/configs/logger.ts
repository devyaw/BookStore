import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true }),
    winston.format.prettyPrint(),
  ),

  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log', level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/info.log', level: 'info',
    })
  ],

})

export default logger
