import Logger from "../../logger";
import { NUMERICAL } from "../../constants";
import { tableGamePlayCache } from "../../cache";
import { bootCollecting } from "../bootAmountCollect";

const roundStart = async (tableId: string, currentRound: number) => {
  try {
    Logger.info(
      tableId,
      `Starting roundStart for tableId : ${tableId} and round : ${currentRound}`
    );

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!tableGamePlay) throw Error("Unable to get data");

    tableGamePlay.tableCurrentTimer = new Date();
    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    if (tableGamePlay.currentPlayerInTable > NUMERICAL.ONE) {
      await bootCollecting(tableId, currentRound, true);
    }

    Logger.info(
      tableId,
      `Ending roundStart for tableId : ${tableId} and round : ${currentRound}`
    );
    return false;
  } catch (error) {
    Logger.error(
      tableId,
      error,
      `table ${tableId} round  ${currentRound} funtion roundStart`
    );
    Logger.info(tableId, "ERROR ::", error);
    throw new Error(`INTERNAL_ERROR_roundStart()`);
  }
};

export default roundStart;
