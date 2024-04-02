import Logger from "../../logger";
import config from "../../config";
import Lock from "../../lock";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../cache";
import { IOnTurnExpireCall } from "../../interfaces/round";
import { NUMERICAL } from "../../constants";

const { CONTINUE_MISSING_TURN_COUNT } = config.getConfig();

const onTurnExpire = async (data: IOnTurnExpireCall) => {
  const { tableId, userId } = data;
  const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
  try {
    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) throw Error("Unable to get Table Config Data");

    const { currentRound } = tableConfig;
    Logger.info(
      tableId,
      `Starting onTurnExpire for tableId : ${tableId} ,userId : ${userId} and round : ${currentRound}`
    );

    const [playerGamePlay, tableGamePlay, userData] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      userProfileCache.getUserProfile(userId.toString()),
    ]);

    if (!tableGamePlay) throw Error("Unable to get Table Game Data");
    if (!playerGamePlay) throw Error("Unable to get Player Game Data");
    if (!userData) throw Error("Unable to get user Game Data");

    const { currentTurn } = tableGamePlay;
    if (currentTurn !== userId) throw Error("Invalid turn in onTurnExpire!");
    Logger.info(tableId, " -- onTurnExpire Call : ==>>");

    const currentCards: string[] = [];
    playerGamePlay.currentCards.map((ele) => {
      ele.map((e: string) => {
        currentCards.push(e);
      });
    });

    Logger.info(
      tableId,
      " turn expire : currentCards :: ",
      currentCards,
      "currentCards.length :: ",
      currentCards.length
    );
    tableGamePlay.isSeconderyTimer = false;

    if (currentCards.length == NUMERICAL.FOURTEEN) {
      // autoDiscard
    } else {
      Logger.info(
        tableId,
        " playerGamePlay.turnTimeOut :::",
        playerGamePlay.turnTimeOut
      );
      playerGamePlay.tCount++;
      playerGamePlay.turnTimeOut++;

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      Logger.info(
        "CONTINUE_MISSING_TURN_COUNT :>> ",
        CONTINUE_MISSING_TURN_COUNT
      );

      if (playerGamePlay.turnTimeOut > Number(CONTINUE_MISSING_TURN_COUNT)) {
        // (IMPLEMENT) LeaveTableFormator
        return { success: true, error: null, tableId };
      }
    }
  } catch (error) {}
};
