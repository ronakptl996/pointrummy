import Joi from "joi";
import { REDIS } from "../../constants";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import redis from "../redisCommon";
import Logger from "../../logger";
import profileService from "../../db/";

const getTableGamePlay = async (
  tableId: string
): Promise<IDefaultTableGamePlay | null> => {
  const key = `${REDIS.TABLE_GAME_PLAY}:${tableId}`;
  try {
    const tableGamePlay = await redis.getValueFromKey<IDefaultTableGamePlay>(
      key
    );
    if (tableGamePlay)
      Joi.assert(tableGamePlay, profileService.TableGamePlay.joiSchema());

    return tableGamePlay;
  } catch (error) {
    Logger.error(
      tableId,
      `Error in getTableGamePlay for tableId ${tableId} and currentRound `,
      error
    );
    throw new Error("Error in getTableGamePlay for tableId" + error);
  }
};

const insertTableGamePlay = async (
  tableGamePlay: IDefaultTableGamePlay,
  tableId: string
) => {
  const key = `${REDIS.TABLE_GAME_PLAY}:${tableId}`;
  try {
    Joi.assert(tableGamePlay, profileService.TableGamePlay.joiSchema());
    const res = await redis.setValueInKeyWithExpiry(key, tableGamePlay);
    return res;
  } catch (error) {}
};

const deleteTableGamePlay = async (tableId: string) => {
  const key = `${REDIS.TABLE_GAME_PLAY}:${tableId}`;
  try {
    return redis.deleteKey(key);
  } catch (error) {
    Logger.error(
      tableId,
      `Error in deleteTableGamePlay for key ${key} `,
      error
    );
    return false;
  }
};

export default { getTableGamePlay, insertTableGamePlay, deleteTableGamePlay };
