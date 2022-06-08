import * as log4js from "log4js";
import Config from "./Config";

const logLevel = Config.getSingleInstance().log.level;

log4js.configure({
    appenders: {
        out: { type: 'stdout', layout: {
            type: 'pattern',
            pattern: '%[[%d] [%p] [%z] %c -%] %m'
        }}
    },
    categories: { default: { appenders: ['out'], level: logLevel} }
});


export function getLogger(name: string) {
    let logger: log4js.Logger;
    logger = log4js.getLogger(name);
    logger.level = logLevel;
    return logger;
}