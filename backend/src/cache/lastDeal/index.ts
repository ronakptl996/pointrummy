import Logger from "../../logger";
import redis from "../redisCommon";
import { REDIS } from "../../constants";
import { IScoreBoardRes } from "../../interfaces/tableConfig";

const setLastDeal = async (userId: string, value: IScoreBoardRes) => {
  const key = `${REDIS.LAST_DEAL}:${userId}`;
  try {
    const res = await redis.setValueInKey(key, value);
    return res;
  } catch (error) {
    Logger.error(userId, `Error in setLastDeal for key ${key} `, error);
    return false;
  }
};

export default { setLastDeal };
