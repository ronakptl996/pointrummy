import Joi from "joi";
import Logger from "../logger";
import { INewGTIResponse, JTResponse } from "../interfaces/tableConfig";
import gtiResponseValidator from "../validators/responseValidator/gtiResponse";
import joinTableResponseValidator from "../validators/responseValidator/joinTableResponse";

const gtiResponseFormator = async (
  gtiResponse: INewGTIResponse
): Promise<INewGTIResponse> => {
  const tableId = gtiResponse.tableId;
  try {
    Joi.assert(gtiResponse, gtiResponseValidator());
    return gtiResponse;
  } catch (error) {
    Logger.error(tableId, error, "-", gtiResponse);
    throw new Error(`gtiResponseFormator()`);
  }
};

const joinTableResponseFormator = async (joinTableResponse: JTResponse) => {
  const userId = joinTableResponse.userId;
  try {
    Joi.assert(joinTableResponse, joinTableResponseValidator());
    return joinTableResponse;
  } catch (error) {
    Logger.error(userId, error, "-", joinTableResponse);
    throw new Error(`Errot ::: ${error}`);
  }
};

export { gtiResponseFormator, joinTableResponseFormator };
