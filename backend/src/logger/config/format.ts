import { format } from "winston";
import winstonTimestampColorize from "winston-timestamp-colorize";

const { printf, timestamp, combine, colorize, align } = format;

const logFormat = printf(
  ({ level, message, timestamp: ts }: any) => `${ts} :: ${level} :: ${message}`
);

export default combine(
  timestamp(),
  align(),
  winstonTimestampColorize({ color: "cyan" }),
  colorize(),
  logFormat
);
