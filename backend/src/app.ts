import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import config from "./config";
import global from "./global";
import { SOCKET } from "./constants";
import server from "./connection/server";
import redis from "./connection/redis";

(async () => {
  try {
    const { getConfig } = config;
    global.getConfigData = getConfig();
    console.log("getConfig() ::>>", getConfig());
    const secureServer = await server.serverConnect;

    const socketConfig = {
      transports: [SOCKET.WEBSOCKET, SOCKET.POLLING],
      allowEIO3: true,
      pingTimeout: 180000,
      pingInterval: 5000,
    };

    const io = require("socket.io")(secureServer, socketConfig);
    const promise = await Promise.all([await redis.redisConnect()]);
    const { client: redisClient } = promise[0];
  } catch (error) {}
})();
