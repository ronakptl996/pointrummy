import { createClient } from "redis";
import IORedis from "ioredis";
import global from "../global";
import config from "../config";
import Logger from "../logger";

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  REDIS_DB,
  PUBSUB_REDIS_HOST,
  PUBSUB_REDIS_PORT,
  PUBSUB_REDIS_AUTH,
  PUBSUB_REDIS_DB,
  NODE_ENV,
} = config.getConfig();

let connectionsMap: any = null;

interface IRedisConfig {
  host: string;
  port: number;
  db: number;
  password?: string;
}

const connectionCallback = async () => {
  return new Promise(async (resolve, reject) => {
    Logger.info("REDIS_HOST >>", REDIS_HOST);
    Logger.info("PUBSUB_REDIS_HOST >>", PUBSUB_REDIS_HOST);

    let counter = 0;
    const redisConfig = {
      socket: {
        host: REDIS_HOST,
        port: Number(REDIS_PORT),
      },
      password: "",
      database: Number(REDIS_DB),
    };

    const pubSubRedisConfig: IRedisConfig = {
      host: REDIS_HOST,
      port: REDIS_PORT,
      db: REDIS_DB,
    };

    if (REDIS_AUTH !== "") redisConfig.password = REDIS_AUTH;
    if (PUBSUB_REDIS_AUTH !== "") pubSubRedisConfig.password = REDIS_AUTH;

    Logger.info("REDIS Data :: >", redisConfig);

    let client: any;
    let pubClient: any;

    // FOR Development Connection
    client = createClient(redisConfig);
    client.connect();
    pubClient = new IORedis(pubSubRedisConfig);

    const subClient = pubClient.duplicate();

    function check() {
      if (counter == 2) {
        connectionsMap = { client, pubClient, subClient };
        global.redisClient = client;
        resolve(connectionsMap);
      }
    }

    client.on("ready", () => {
      Logger.info(">> Redis Connected");
      counter += 1;
      check();
    });

    client.on("error", (err: any) => {
      Logger.error("Redis Client connection Error >>", err);
      reject(err);
    });

    pubClient.on("ready", () => {
      Logger.info(">> pubClient Connected");
      counter += 1;
      check();
    });

    pubClient.on("error", (err: any) => {
      Logger.error("Pub Client connection Error >>", err);
      reject(err);
    });
  });
};

const init = async () => connectionsMap || connectionCallback();

export default { redisConnect: init };
