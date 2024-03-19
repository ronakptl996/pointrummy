import Logger from "../../logger";
import { tableGamePlayCache } from "../../cache";
import { defaultTableGamePlayData } from "../../defaultGenerator";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";

interface ISetUpRoundData {
  tableId: string;
  gameType: string;
}

const setUpFirstRound = async (data: ISetUpRoundData): Promise<boolean> => {
  const { tableId, gameType } = data;
  try {
    Logger.info(tableId, `Starting setupFirstRound for tableId : ${tableId}`);

    const tableGamePlayData: IDefaultTableGamePlay =
      defaultTableGamePlayData(gameType);

    Logger.info("====tableGamePlayData====", tableGamePlayData);
    await tableGamePlayCache.insertTableGamePlay(tableGamePlayData, tableId);

    Logger.info(tableId, `Ending setupFirstRound for tableId : ${tableId}`);

    return true;
  } catch (error: any) {
    Logger.error(tableId, error, ` table ${tableId} function setupFirstRound`);
    throw new Error(
      error && error.message && typeof error.message === "string"
        ? error.message
        : `Error in setupFirstRound`
    );
  }
};

export default setUpFirstRound;
