import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import requestHandler from "../requestHandlers";
import { REDIS, SOCKET } from "../constants";
import global from "../global";
import Logger from "../logger";
import redis from "./redis";

async function socket() {
  try {
    const { pubClient, subClient } = await redis.redisConnect();

    if (!pubClient || !subClient) {
      process.exit(1);
    }

    const io = new Server({
      adapter: createAdapter(pubClient, subClient),
    });

    global.IO = io;

    io.on(SOCKET.CONNECTION, async (socket: any) => {
      Logger.info(
        "<<== Socket connect :: SUCCESS ===>> user connection sockrtId ::",
        socket.id
      );

      // (IMPLEMENT) GET ONLINE PLAYER COUNT

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

      socket.use(requestHandler.bind(socket));
    });
  } catch (error) {
    Logger.error(" SOCKET Connection ERROR :: ", error);
  }
}

export default { socketConnect: socket };
