import { transports } from "winston";
import level from "./level";
import format from "./format";

let config: any;
const myDate = new Date();
const newFileName =
  myDate.getFullYear() + "-" + myDate.getMonth() + "-" + myDate.getDate();
const NODE_ENV = process.env.NODE_ENV;

if (NODE_ENV === "PRODUCTION") {
  config = {
    level,
    format,
    transports: [
      new transports.Console({ level: "debug" }),
      new transports.File({ filename: "./logs/error.log", level: "error" }),
      new transports.File({
        handleExceptions: true,
        filename: `./logs/${newFileName}.log`,
        level: "debug",
      }),
    ],
  };
} else {
  config = {
    level,
    format,
    transports: [new transports.Console({ level: "debug" })],
  };
}

export default config;
