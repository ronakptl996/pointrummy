import Joi from "joi";
import Logger from "../../logger";
import playerService from "../../db";
import { REDIS } from "../../constants";
import { IDefaultPlayerGamePlay } from "../../interfaces/playerGamePlay";
import redis from "../redisCommon";

const insertPlayerGamePlay = async (
  playerGamePlay: IDefaultPlayerGamePlay,
  tableId: string
): Promise<boolean> => {
  const key = `${REDIS.PLAYER_GAME_PLAY}:${playerGamePlay.userId}:${tableId}`;

  try {
    Joi.assert(playerGamePlay, playerService.PlayerGamePlay.joiSchema());

    const res = await redis.setValueInKeyWithExpiry(key, playerGamePlay);
    return res;
  } catch (error) {
    Logger.error(`Error in insertPlayerGamePlay for key ${key} `, error);
    throw new Error(
      `Error in insertPlayerGamePlay for key ${key} Error :: ${error}`
    );
  }
};

const getPlayerGamePlay = async (
  userId: string,
  tableId: string
): Promise<IDefaultPlayerGamePlay | null> => {
  const keyData = `${REDIS.PLAYER_GAME_PLAY}:${userId}:${tableId}`;

  try {
    const playerGamePlay = await redis.getValueFromKey<IDefaultPlayerGamePlay>(
      keyData
    );
    if (playerGamePlay)
      Joi.assert(playerGamePlay, playerService.PlayerGamePlay.joiSchema());

    return playerGamePlay;
  } catch (error) {
    Logger.error(`Error in getPlayerGamePlay for key ${keyData}`, error);
    throw new Error(
      `Error in getPlayerGamePlay for key ${keyData} Error :: ${error}`
    );
  }
};

const deletePlayerGamePlay = async (userId: string, tableId: string) => {
  const key = `${REDIS.PLAYER_GAME_PLAY}:${userId}:${tableId}`;
  try {
    return await redis.deleteKey(key);
  } catch (e) {
    Logger.error(`Error in deletePlayerGamePlay for key ${key} `, e);
    return false;
  }
};

export default {
  insertPlayerGamePlay,
  getPlayerGamePlay,
  deletePlayerGamePlay,
};
