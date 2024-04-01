import Logger from "../../logger";
import redis from "../redisCommon";
import { REDIS } from "../../constants";
import { IGameDetails } from "../../interfaces/turnHistory";

const getTurnHistory = (tableId: string) => {
  const key = `${REDIS.TURN_HISTORY}:${tableId}`;
  try {
    return redis.getValueFromKey<Array<IGameDetails>>(key);
  } catch (error) {
    Logger.error(tableId, `Error in getTurnHistory for key ${key} `, error);
    return null;
  }
};

const setTurnHistory = async (tableId: string, value: Array<IGameDetails>) => {
  const key = `${REDIS.TURN_HISTORY}: ${tableId}`;
  try {
    return await redis.setValueInKeyWithExpiry(key, value);
  } catch (error) {
    Logger.error(tableId, `Error in setTurnHistory for key ${key} `, error);
    return false;
  }
};

export default { getTurnHistory, setTurnHistory };
