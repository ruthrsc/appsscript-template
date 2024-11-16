export class SimpleLogger {
  private logs: string = "";
  private consoleEnabled: boolean = false;

  constructor(consoleEnabled = false) {
    this.consoleEnabled = consoleEnabled;
  }

  public log(message?: unknown): string {
    if (message) {
      this.logs += `${message}\n`;
      Logger.log(message);
      if (this.consoleEnabled && console && console.log) {
        console.log(message);
      }
    }

    return this.logs;
  }

  public reset(): void {
    this.logs = "";
  }
  public setConsoleLogging(enabled: boolean): void {
    this.consoleEnabled = enabled;
  }
}

export const simpleLogger = new SimpleLogger();
export function mylog(message?: unknown): string {
  return simpleLogger.log(message);
}
