import { NUMERICAL, REDIS } from "../../constants";
import Logger from "../../logger";
import redis from "../redisCommon";

async function incrCounter(onlinePlayer: string) {
  const key = `${REDIS.ONLINE_USER_COUNTER}:${onlinePlayer}`;
  try {
    return await redis.setIncrementCounter(key);
  } catch (error) {
    Logger.error(`Error in incrCounter for key ${key} `, error);
    return false;
  }
}

async function getOnlinePlayerCount(onlinePlayer: string) {
  console.log("getOnlinePlayerCount called");

  const key = `${REDIS.ONLINE_USER_COUNTER}:${onlinePlayer}`;
  try {
    return await redis.getValueFromKey(key);
  } catch (error) {
    Logger.error(`Error in getOnliPlayerCount for key ${key}`, error);
    return false;
  }
}

async function setPlayerCounterInitialValue(onlinePlayer: string) {
  try {
    let count = NUMERICAL.ZERO;
    const key = `${REDIS.ONLINE_USER_COUNTER}:${onlinePlayer}`;

    return await redis.setValueInKey(key, count);
  } catch (error) {}
}

export { getOnlinePlayerCount, setPlayerCounterInitialValue, incrCounter };
