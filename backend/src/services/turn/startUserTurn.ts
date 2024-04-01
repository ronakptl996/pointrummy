import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
} from "../../cache";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT, NUMERICAL } from "../../constants";
import { formatStartUserTurn } from "../../formatResponseData";
import { IStartUserTurnResponse } from "../../interfaces/round";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import Logger from "../../logger";
import { addTurnHistory } from "../turnHistory";

const startUserTurn = async (
  tableId: string,
  currentTurnUserId: string,
  currentTurnSeatIndex: number,
  tableGamePlay: IDefaultTableGamePlay
) => {
  try {
    Logger.info(
      tableId,
      "------->> startUserTurn",
      "tableId",
      tableId,
      "currentTurnUserId",
      currentTurnUserId,
      "currentTurnSeatIndex",
      currentTurnSeatIndex
    );

    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) {
      throw Error("Unable to get Table Config Data");
    }

    const { currentRound } = tableConfig;

    Logger.info(
      tableId,
      `Starting startUserTurn for tableId : ${tableId} and round : ${currentRound} user ${currentTurnUserId}`
    );

    const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(
      currentTurnUserId,
      tableId
    );
    if (!playerGamePlay) {
      throw Error("Unable to get Table Config Data");
    }

    tableGamePlay.currentTurn = currentTurnUserId;
    tableGamePlay.currentTurnSeatIndex = currentTurnSeatIndex;
    tableGamePlay.isSeconderyTimer = false;
    Logger.info(tableId, `user ${currentTurnUserId} turn timer started ->>`);

    let isRemainSeconderyTimer = false;
    if (playerGamePlay.seconderyTimerCounts < NUMERICAL.FOUR) {
      isRemainSeconderyTimer = true;
    }

    const formatedStartUserTurnData: IStartUserTurnResponse =
      await formatStartUserTurn(
        tableConfig,
        currentTurnUserId,
        currentTurnSeatIndex,
        false,
        isRemainSeconderyTimer,
        tableId
      );

    playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

    const currentTime = new Date();
    tableGamePlay.turnCount += NUMERICAL.ONE;
    tableGamePlay.updatedAt = new Date().toString();
    tableGamePlay.tableCurrentTimer = new Date(
      currentTime.setSeconds(
        currentTime.getSeconds() + Number(tableConfig.userTurnTimer)
      )
    );

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    Logger.info(
      tableId,
      "==== ResData : formatedStartUserTurnData ::",
      formatedStartUserTurnData
    );

    commonEventEmitter.emit(EVENT.USER_TURN_STARTED_SOCKET_EVENT, {
      tableId: tableId,
      data: formatedStartUserTurnData,
    });

    // Add Turn Details in History
    await addTurnHistory(tableId, currentRound, tableGamePlay, playerGamePlay);
  } catch (error) {
    Logger.info(tableId, error);
    Logger.error(tableId, error, ` table ${tableId} function startUserTurn `);
    throw new Error(`startUserTurn() Error : ===>> ${error}`);
  }
};

export default startUserTurn;
