import { createLogger } from "winston";
import config from "./config/config";
import level from "./config/level";
import { formatLogMessages } from "./helper";

const winston = createLogger(config);

const logger = (type: any, ...messages: any) => {
  const message = formatLogMessages(messages);

  let isLoganable = true;
  if (isLoganable) {
    switch (type) {
      case level.warn:
        winston.warn(message);
        break;

      case level.info:
        winston.info(message);
        break;

      case level.debug:
        winston.debug(message);
        break;

      case level.error:
        winston.error(message);
        break;

      default:
        break;
    }
  }

  return { type, message };
};

export default logger;
