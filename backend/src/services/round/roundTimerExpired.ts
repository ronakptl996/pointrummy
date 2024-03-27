import Logger from "../../logger";
import { IRoundStart } from "../../interfaces/common";
import roundStart from "./roundStart";

const roundTimerExpired = async (gameData: IRoundStart) => {
  const { tableId, currentRound } = gameData;
  try {
    Logger.info(
      tableId,
      `Starting roundTimerExpired for tableId : ${tableId} and round : ${currentRound}`
    );

    await roundStart(tableId, currentRound);

    Logger.info(
      tableId,
      `Ending roundTimerExpired for tableId : ${tableId} and round : ${currentRound}`
    );

    return false;
  } catch (error) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} round ${currentRound} function roundTimerExpired`
    );
    throw error;
  }
};

export default roundTimerExpired;
