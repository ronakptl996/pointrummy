import Logger from "../../logger";
import config from "../../config";
import commonEventEmitter from "../../commonEventEmitter";
import { IPlayerTurnTimer } from "../../interfaces/scheduler";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
} from "../../cache";
import { EVENT, NUMERICAL } from "../../constants";
import insertPlayerInTable from "../userPlayTable/insertPlayerInTable";
import { formatStartUserTurn } from "../../formatResponseData";
import { IStartUserTurnResponse } from "../../interfaces/round";
import secondaryTimerStart from "../../scheduler/queues/secondaryTimer.queue";
import onTurnExpire from "./turnExpire";

const secondaryTimer = async (data: IPlayerTurnTimer) => {
  const { SECONDARY_TIMER } = config.getConfig();
  const { userId, tableId } = data;
  try {
    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) throw Error("Unable to get Table Config Data");

    const { currentRound } = tableConfig;
    Logger.info(
      tableId,
      `Starting seconderyTimer for tableId : ${tableId} ,userId : ${userId} and round : ${currentRound}`
    );

    const [playerGamePlay, tableGamePlay] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
    ]);
    if (!tableGamePlay) throw Error("Unable to get Table Game Data");
    if (!playerGamePlay) throw Error("Unable to get Player Game Data");

    const { currentTurn } = tableGamePlay;
    if (currentTurn !== userId) throw Error("Invalid turn in onTurnExpire!");
    Logger.info(tableId, "seconderyTimer :: onTurnExpire Call :>>");

    if (playerGamePlay.seconderyTimerCounts < NUMERICAL.FOUR) {
      Logger.info(
        tableId,
        ` seconderyTimer :: seconderyTimerCounts :: ${playerGamePlay.seconderyTimerCounts}`
      );
      Logger.info(tableId, ` seconderyTimer :: timer start ::`);

      const currentTime = new Date();

      playerGamePlay.seconderyTimerCounts += 1;
      tableGamePlay.updatedAt = new Date().toString();
      tableGamePlay.isSeconderyTimer = true;
      tableGamePlay.tableCurrentTimer = new Date(
        currentTime.setSeconds(
          currentTime.getSeconds() + Number(tableConfig.userTurnTimer)
        )
      );

      await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      const formatedStartUserTurnData: IStartUserTurnResponse =
        await formatStartUserTurn(
          tableConfig,
          playerGamePlay.userId,
          playerGamePlay.seatIndex,
          true,
          true,
          tableId
        );

      commonEventEmitter.emit(EVENT.USER_TURN_STARTED_SOCKET_EVENT, {
        tableId: tableId,
        data: formatedStartUserTurnData,
      });

      await secondaryTimerStart({
        timer: Number(SECONDARY_TIMER),
        jobId: data.jobId,
        tableId: data.tableId,
        userId: data.userId,
      });
    } else {
      Logger.info(
        tableId,
        ` seconderyTimer :: seconderyTimerCounts :: ${playerGamePlay.seconderyTimerCounts}`
      );
      Logger.info(tableId, ` seconderyTimer :: onTurnExpire`);

      onTurnExpire(data);
    }
  } catch (error) {
    Logger.error(tableId, "--- seconderyTimer ::: ERROR :: ", error);
  }
};

export default secondaryTimer;
