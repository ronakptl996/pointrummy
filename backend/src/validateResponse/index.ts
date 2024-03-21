import Joi from "joi";
import Logger from "../logger";
import { INewGTIResponse } from "../interfaces/tableConfig";
import gtiResponseValidator from "../validators/responseValidator";

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

export { gtiResponseFormator };
