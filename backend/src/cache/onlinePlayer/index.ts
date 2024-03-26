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

const getOnlinePlayerCountLobbyWise = async (
  onlinePlayerLobby: string,
  lobbId: string
) => {
  try {
    const key = `${REDIS.ONLINE_USER_COUNTER}:${lobbId}:${onlinePlayerLobby}`;
    console.log(" >> getOnlinePlayerCountLobbyWise >>  ", key);

    return await redis.getValueFromKey(key);
  } catch (error) {
    Logger.error("CATCH_ERROR :  getOnliPlayerCountLobbyWise", error);
    return false;
  }
};

const setCounterInitialValueLobby = async (
  onlinePlayerLobby: string,
  lobbId: string
) => {
  try {
    let counter = NUMERICAL.ZERO;
    const key = `${REDIS.ONLINE_USER_COUNTER}:${lobbId}:${onlinePlayerLobby}`;
    return await redis.setValueInKey(key, counter);
  } catch (error) {
    Logger.error("CATCH_ERROR :  setCounterIntialValueLobby", error);
    return false;
  }
};

const incrCounterLobbyWise = (onlinePlayerLobby: string, lobbId: string) => {
  try {
    return redis.setIncrementCounter(
      `${REDIS.ONLINE_USER_COUNTER}:${lobbId}:${onlinePlayerLobby}`
    );
  } catch (error) {
    Logger.error("CATCH_ERROR : incrCounterLobbyWise", error);
    throw error;
  }
};

export {
  getOnlinePlayerCount,
  setPlayerCounterInitialValue,
  incrCounter,
  getOnlinePlayerCountLobbyWise,
  setCounterInitialValueLobby,
  incrCounterLobbyWise,
};
