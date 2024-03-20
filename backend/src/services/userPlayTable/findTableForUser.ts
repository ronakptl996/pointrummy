import Logger from "../../logger";
import findOrCreateTable from "../playTable/findTable";
import insertPlayerInTable from "./insertPlayerInTable";
import { ICreateTable } from "../../interfaces/signup";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import { IDefaultTableConfig } from "../../interfaces/tableConfig";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import { IDefaultPlayerGamePlay } from "../../interfaces/playerGamePlay";

const findTableForUser = async (
  data: ICreateTable,
  userProfile: IUserProfileOutput
): Promise<{
  tableConfig: IDefaultTableConfig;
  tableGamePlay: IDefaultTableGamePlay;
  playerGamePlay: IDefaultPlayerGamePlay;
}> => {
  const tableId = await findOrCreateTable(data);

  try {
    Logger.info(
      tableId,
      `Starting findTableForUser for userid : ${userProfile.id}`
    );
    Logger.info(
      tableId,
      `Table with tableId : ${tableId} found or created for userid : ${userProfile.id}`
    );

    const insertPlayerRes = await insertPlayerInTable(userProfile, tableId);
    if (!insertPlayerRes) throw Error("Unable to insert player in table");

    const playerGamePlay = insertPlayerRes?.playerGamePlay;
    const tableGamePlay = insertPlayerRes?.tableGamePlay;
    const tableConfig = insertPlayerRes?.tableConfig;

    Logger.info(
      tableId,
      `Ending findTableForUser for userid : ${userProfile.id}`
    );

    return { tableConfig, tableGamePlay, playerGamePlay };
  } catch (error: any) {
    Logger.error(`function findTableForUser`, tableId, error);
    throw new Error(
      error && error.message && typeof error.message === "string"
        ? error.message
        : "function findTableForUser"
    );
  }
};

export default findTableForUser;
