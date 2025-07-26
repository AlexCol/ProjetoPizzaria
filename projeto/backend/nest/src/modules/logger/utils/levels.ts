import colours from "./colours";

const LEVELS = {
  log: { color: colours.fg.magenta, fn: console.log },
  error: { color: colours.fg.red, fn: console.error },
  warn: { color: colours.fg.orange, fn: console.warn },
  debug: { color: colours.fg.yellow, fn: console.debug },
  verbose: { color: colours.fg.blue, fn: console.info },
};

export default LEVELS;