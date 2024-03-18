import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import requestHandler from "../requestHandlers";
import { REDIS, SOCKET } from "../constants";
import global from "../global";
import Logger from "../logger";
import redis from "./redis";
import {
  getOnlinePlayerCount,
  incrCounter,
  setPlayerCounterInitialValue,
} from "../cache/onlinePlayer";

async function socket(io: any) {
  try {
    const { pubClient, subClient } = await redis.redisConnect();

    if (!pubClient || !subClient) {
      process.exit(1);
    }

    global.IO = io;
    await io.adapter(createAdapter(pubClient, subClient));

    io.on(SOCKET.CONNECTION, async (socket: any) => {
      Logger.info(
        "<<== Socket connect :: SUCCESS ===>> user connection sockrtId ::",
        socket.id
      );

      let getOnlinePlayerCountData = await getOnlinePlayerCount(
        REDIS.ONLINEPLAYER
      );
      Logger.info("getOnlinePlayerCountData :>>", getOnlinePlayerCountData);

      if (!getOnlinePlayerCountData) {
        const counterIntialValue = await setPlayerCounterInitialValue(
          REDIS.ONLINEPLAYER
        );
        console.log("const counterIntialValue >>", counterIntialValue);
      }

      let count = await incrCounter(REDIS.ONLINEPLAYER);
      Logger.info("insertNewPlayer :: count ::>> ", count);

      const token = socket.handshake.auth.token;
      Logger.info("connectionCB token :>> ", token);
      socket.authToken = token;

      socket.on(SOCKET.ERROR, function (err: any) {
        Logger.error(" SOCKET ERROR :: ", err);
      });

      socket.conn.on(SOCKET.PACKET, async (packet: any) => {
        if (packet.type === "ping") {
          Logger.info("Ping received......");
        }
      });

      socket.on(SOCKET.DISCONNECT, async (disc: any) => {
        // await decrCounter(REDIS.ONLINEPLAYER);
        // disconnectHandler({}, socket);
        Logger.warn(" SOCKET DISCONNECT ::", disc, "socketID::", socket.id);
      });

      // Bind Request Handler
      socket.use(requestHandler.bind(socket));
    });
  } catch (error) {
    Logger.error(" SOCKET Connection ERROR :: ", error);
  }
}

export default { socketConnect: socket };
