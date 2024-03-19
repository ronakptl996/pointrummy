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

export default { getTableFromQueue, setTableFromQueue, setTableConfig };
