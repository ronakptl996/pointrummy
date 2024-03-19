import { tableConfigCache } from "../../cache";
import { defaultTableData } from "../../defaultGenerator";
import { ICreateTable } from "../../interfaces/signup";
import Logger from "../../logger";

const createTable = async (signUpData: ICreateTable) => {
  const userId = signUpData.userId;

  try {
    Logger.info(
      userId,
      `Starting createTable for userId : ${signUpData.userId}`
    );

    const tableConfig = defaultTableData(signUpData);

    await tableConfigCache.setTableConfig(tableConfig._id, tableConfig);
    Logger.info(
      userId,
      `Ending createTable for userId : ${signUpData.userId} and tableId ::  ${tableConfig._id}`
    );

    return String(tableConfig._id);
  } catch (error: any) {
    Logger.error(userId, `Error in createTable`, error);
    // ignoring for signup
    throw new Error(
      error && error.message && typeof error.message === "string"
        ? error.message
        : `Error in createTable`
    );
  }
};

export default createTable;
