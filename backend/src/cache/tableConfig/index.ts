import Joi from "joi";
import redis from "../redisCommon";
import Logger from "../../logger";
import profileServices from "../../db";
import { REDIS } from "../../constants";
import { IDefaultTableConfig } from "../../interfaces/tableConfig";

const getTableFromQueue = async (key: string): Promise<any> => {
  return await redis.getValueFromKey(`${REDIS.QUEUE}:${key}`);
};

const setTableFromQueue = async (key: string, data: any) => {
  return await redis.setValueInKey(`${REDIS.QUEUE}:${key}`, data);
};

const setTableConfig = async (tableId: string, obj: IDefaultTableConfig) => {
  const key = `${REDIS.GAME_TABLE}:${tableId}`;

  try {
    Joi.assert(obj, profileServices.TableConfig.joiSchema());
    const res = await redis.setValueInKeyWithExpiry(key, obj);
    return res;
  } catch (error) {
    Logger.error(
      tableId,
      `Error in setTableConfig for key ${key} and object ${JSON.stringify(
        obj
      )} `,
      error
    );

    throw new Error(
      `Error in setTableConfig for key ${key} and object ${JSON.stringify(
        obj
      )} `
    );
  }
};

const getTableConfig = async (
  tableId: string
): Promise<IDefaultTableConfig | null> => {
  const key = `${REDIS.GAME_TABLE}:${tableId}`;
  try {
    const tableConfig = await redis.getValueFromKey<IDefaultTableConfig>(key);
    if (tableConfig)
      Joi.assert(tableConfig, profileServices.TableConfig.joiSchema());
    return tableConfig;
  } catch (error) {
    Logger.error(tableId, `Error in getTableConfig for key ${key} `, error);
    throw new Error(
      `Error in getTableConfig for key ${key}, ERROR :: ${error}`
    );
  }
};

export default {
  getTableFromQueue,
  setTableFromQueue,
  getTableConfig,
  setTableConfig,
};
