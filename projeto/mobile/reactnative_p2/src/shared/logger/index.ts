/* eslint-disable no-console */

export class Logger {
  static log(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
  }
  static error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  }
}
