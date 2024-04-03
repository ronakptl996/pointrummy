import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../cache";
import { NUMERICAL, TABLE_STATE } from "../../constants";
import Logger from "../../logger";
import { autoDiscard } from "../turn/helper";

const leaveTable = async (
  userId: string,
  tableId: string,
  isLeaveEventSend: boolean,
  socketId: string
) => {
  try {
    Logger.info(
      tableId,
      `Starting leaveTable for tableId : ${tableId} and userId : ${userId}`
    );
    Logger.info(tableId, " leaveTable : userId :: ", userId);
    Logger.info(tableId, " leaveTable : tableId :: ", tableId);

    const [tableConfig, tableGamePlay, playerGamePlay, userProfile] =
      await Promise.all([
        tableConfigCache.getTableConfig(tableId),
        tableGamePlayCache.getTableGamePlay(tableId),
        playerGamePlayCache.getPlayerGamePlay(userId, tableId),
        userProfileCache.getUserProfile(userId),
      ]);

    if (!tableConfig) throw new Error("Unable to get table config");
    if (!tableGamePlay) throw new Error("Unable to get table game play");
    if (!playerGamePlay) throw new Error("Unable to get player game play");
    if (!userProfile) throw new Error("Unable to get user profile");

    Logger.info(
      tableId,
      " leaveTable :: >> tableGamePlay.tableState ::",
      tableGamePlay.tableState
    );
    Logger.info(
      tableId,
      " leaveTable :: >> playerGamePlay :: ",
      playerGamePlay
    );
    Logger.info(tableId, " leaveTable :: >> userProfile :: ", userProfile);

    // if leave user have 14 cards then discard cards befor leaving
    const currentCards: string[] = [];
    playerGamePlay.currentCards.map((ele) => {
      ele.map((e: string) => {
        currentCards.push(e);
      });
    });

    if (currentCards.length === NUMERICAL.FOURTEEN) {
      await autoDiscard(
        userId,
        tableId,
        NUMERICAL.ONE,
        playerGamePlay,
        tableGamePlay
      );
    }

    if (
      tableGamePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS ||
      tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
      tableGamePlay.tableState === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS ||
      tableGamePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD ||
      tableGamePlay.tableState === TABLE_STATE.COLLECTING_BOOT_VALUE
    ) {
      const manageLeaveTableRes = await manageLeaveTable(
        userId,
        tableId,
        socketId,
        isLeaveEventSend
      );
      if (!manageLeaveTableRes) return true;
    }
  } catch (error) {}
};
