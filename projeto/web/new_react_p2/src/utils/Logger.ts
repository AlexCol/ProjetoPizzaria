/* eslint-disable no-console */
export default class Logger {
  static log(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    console.log(`[LOG] ${message}`, ...optionalParams);
  }

  static warn(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    console.warn(`[WARN] ${message}`, ...optionalParams);
  }

  static error(message: any, ...optionalParams: any[]) {
    console.log(`[ERROR] ${message}`, ...optionalParams);
  }
}
