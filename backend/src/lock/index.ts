import IORedis from "ioredis";
import Logger from "../logger";
import Redlock from "redlock";
import config from "../config";

const { REDIS_HOST, REDIS_PORT, REDIS_DB } = config.getConfig();
const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_DB,
};

let redLock: any = null;

function registerRedLockError(): void {
  redLock.on("error", (error: any) => Logger.error("REDIS_LOCK_ERROR", error));
}

function initializeRedLock(): void {
  if (redLock) return redLock;

  const ioRedis = new IORedis(redisConfig);
  redLock = new Redlock([ioRedis], {
    driftFactor: 0.01,
    retryCount: -1,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
  });

  registerRedLockError();
  return redLock;
}

export default {
  init: initializeRedLock,
  getLock: () => redLock,
};
