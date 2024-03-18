import Logger from "../logger";
import Redlock from "redlock";

let redLock: any = null;

function registerRedLockError(): void {
  redLock.on("error", (error: any) => Logger.error("REDIS_LOCK_ERROR", error));
}

function initializeRedLock(redisClient: any): void {
  if (redLock) return redLock;

  redLock = new Redlock([redisClient], {
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
