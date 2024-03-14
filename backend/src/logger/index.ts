import level from "./config/level";
import logger from "./logger";

const exportObject = {
  warn: logger.bind(null, level.warn),
  info: logger.bind(null, level.info),
  debug: logger.bind(null, level.debug),
  error: logger.bind(null, level.error),
};

export default exportObject;
