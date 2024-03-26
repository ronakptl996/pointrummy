import Joi from "joi";
import Logger from "../logger";
import { INewGTIResponse, JTResponse } from "../interfaces/tableConfig";
import { ICountDown } from "../interfaces/round";
import gtiResponseValidator from "../validators/responseValidator/gtiResponse";
import joinTableResponseValidator from "../validators/responseValidator/joinTableResponse";
import countDownResponseValidator from "../validators/responseValidator/countDownResponse";

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

const countDownResponseFormator = async (
  countDownData: ICountDown
): Promise<ICountDown> => {
  const tableId = countDownData.tableId;
  try {
    Joi.assert(countDownData, countDownResponseValidator());
    return countDownData;
  } catch (error) {
    Logger.error(tableId, error, "-", countDownData);
    throw new Error(`countDownResponseFormator() Erorr::${error}`);
  }
};

export {
  gtiResponseFormator,
  joinTableResponseFormator,
  countDownResponseFormator,
};
