import Joi from "joi";
import { REDIS } from "../../constants";
import { IDefaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import redis from "../redisCommon";
import Logger from "../../logger";
import profileService from "../../db/";

const getTableGamePlay = async (
  tableId: string
): Promise<IDefaultTableGamePlayInterface | null> => {
  const key = `${REDIS.TABLE_GAME_PLAY}:${tableId}`;
  try {
    const tableGamePlay =
      await redis.getValueFromKey<IDefaultTableGamePlayInterface>(key);
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

export default { getTableGamePlay };
