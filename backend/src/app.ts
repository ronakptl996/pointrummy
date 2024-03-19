import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import config from "./config";
import global from "./global";
import { SOCKET } from "./constants";
import server from "./connection/server";
import redis from "./connection/redis";
import socket from "./connection/socket";
import Logger from "./logger";
import Lock from "./lock";

(async () => {
  try {
    const { getConfig } = config;
    global.getConfigData = getConfig();
    console.log("getConfig() ::>>", getConfig());
    const secureServer = await server.serverConnect;

    /** redis and socket connection */
    const socketConfig = {
      transports: [SOCKET.WEBSOCKET, SOCKET.POLLING],
      allowEIO3: true,
      pingTimeout: 180000,
      pingInterval: 5000,
    };

    const io = require("socket.io")(secureServer, socketConfig);

    const promise = await Promise.all([
      await redis.redisConnect(),
      await socket.socketConnect(io),
    ]);

    const { client: redisClient } = promise[0];
    require("./commonEventHandlers/socket");

    // Initialize Lock
    Lock.init();

    const isLoganable = true;
    global.isLoganable = isLoganable;

    const {
      getConfigData: { HTTP_SERVER_PORT },
    } = global;

    const port = HTTP_SERVER_PORT || 1000;
    secureServer.listen(port, function () {
      Logger.info(`<<== Listening on PORT : ${port} ==>>`);
    });
  } catch (error) {
    Logger.error(`Server listen error :::=>`, error);
  }
})();

process
  .on("unhandledRejection", (reason: any, p: any) => {
    Logger.error(
      reason,
      "Unhandled Rejection at Promise >> ",
      new Date(),
      " >> ",
      p
    );
  })
  .on("uncaughtException", (err) => {
    Logger.error("Uncaught Exception thrown", new Date(), " >> ", "\n", err);
  });
