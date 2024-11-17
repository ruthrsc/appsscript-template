export class SimpleLogger {
    constructor(consoleEnabled = false) {
        this.logs = "";
        this.consoleEnabled = false;
        this.consoleEnabled = consoleEnabled;
    }
    log(message) {
        if (message) {
            this.logs += `${message}\n`;
            Logger.log(message);
            if (this.consoleEnabled && console && console.log) {
                console.log(message);
            }
        }
        return this.logs;
    }
    reset() {
        this.logs = "";
    }
    setConsoleLogging(enabled) {
        this.consoleEnabled = enabled;
    }
}
export const simpleLogger = new SimpleLogger();
export function mylog(message) {
    return simpleLogger.log(message);
}
