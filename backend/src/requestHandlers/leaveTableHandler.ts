import Errors from "../errors";
import Lock from "../lock";
import { leaveTableFormator } from "../InputDataFormator";
import { ILeaveTableInput } from "../interfaces/inputOutputDataFormator";
import Logger from "../logger";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
} from "../cache";
import { NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../constants";
import { leaveClientInRoom } from "../socket";

const leaveTableHandler = async (
  socket: any,
  leaveTableData: ILeaveTableInput,
  isLeaveEventSend: boolean = true
) => {
  const socketId = socket.id;
  const userId = String(leaveTableData.userId) || socket.userId;
  const tableId: string = String(leaveTableData.tableId) || socket.tableId;

  let lock: any = null;
  try {
    Logger.info(tableId, "leaveTableHandler : starting ...");
    const formatedLeaveTableHandlerData = await leaveTableFormator(
      leaveTableData
    );
    Logger.info(
      tableId,
      " reqData :: formatedLeaveTableHandlerData ==>>",
      formatedLeaveTableHandlerData
    );

    lock = await Lock.getLock().acquire([tableId], 2000);

    const [tableConfig, tableGamePlay, playerGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
    ]);

    if (!tableGamePlay)
      throw new Errors.UnknownError("Unable to get table game play");
    if (!playerGamePlay)
      throw new Errors.UnknownError("Unable to get player game play");
    if (!tableConfig)
      throw new Errors.UnknownError("Unable to get player game play");

    Logger.info(
      tableId,
      "leaveTableHandler :: tableGamePlay ::==>",
      tableGamePlay
    );
    Logger.info(
      tableId,
      "leaveTableHandler :: playerGamePlay ::==>",
      playerGamePlay
    );
    Logger.info(
      tableId,
      "leaveTableHandler :: playerGamePlay.userStatus ::==>",
      playerGamePlay.userStatus
    );
    Logger.info(
      tableId,
      "leaveTableHandler :: tableGamePlay.tableState ::==>",
      tableGamePlay.tableState
    );

    if (
      tableGamePlay.tableState !== TABLE_STATE.WAITING_FOR_PLAYERS &&
      tableGamePlay.tableState !== TABLE_STATE.WAIT_FOR_OTHER_PLAYERS &&
      tableGamePlay.tableState !== TABLE_STATE.ROUND_TIMER_STARTED &&
      tableGamePlay.tableState !== TABLE_STATE.LOCK_IN_PERIOD &&
      tableGamePlay.tableState !== TABLE_STATE.COLLECTING_BOOT_VALUE &&
      tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
      tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD
    ) {
      Logger.info(
        tableId,
        "leaveTableHandler :: Before :: playerGamePlay :>",
        playerGamePlay
      );
      Logger.info(
        tableId,
        "leaveTableHandler :: Before :: tableGamePlay :: ",
        tableGamePlay
      );

      if (playerGamePlay.userStatus == PLAYER_STATE.PLAYING) {
        Logger.info(
          tableId,
          "-------->> leaveTableHandler :: status :: ",
          playerGamePlay.userStatus
        );
        playerGamePlay.userStatus = PLAYER_STATE.QUIT;
        playerGamePlay.looseingCash = NUMERICAL.EIGHTY * tableConfig.entryFee;
        tableGamePlay.currentPlayerInTable =
          tableGamePlay.currentPlayerInTable - NUMERICAL.ONE;
        for (let i = 0; i < tableGamePlay.seats.length; i++) {
          const ele = tableGamePlay.seats[i];
          if (ele.userId == userId) {
            ele.userState = PLAYER_STATE.QUIT;
          }
        }
      } else if (playerGamePlay.userStatus == PLAYER_STATE.WATCHING) {
        playerGamePlay.userStatus = PLAYER_STATE.WATCHING_LEAVE;
        for (let i = 0; i < tableGamePlay.seats.length; i++) {
          const ele = tableGamePlay.seats[i];
          if (ele.userId == userId) {
            ele.userState = PLAYER_STATE.QUIT;
          }
        }
      } else if (
        playerGamePlay.userStatus == PLAYER_STATE.DROP ||
        playerGamePlay.userStatus == PLAYER_STATE.WRONG_SHOW
      ) {
        Logger.info(
          tableId,
          "-------->> leaveTableHandler :: status :: ",
          playerGamePlay.userStatus
        );
        // playerGamePlay.userStatus = PLAYER_STATE.QUIT;
        for (let i = 0; i < tableGamePlay.seats.length; i++) {
          const ele = tableGamePlay.seats[i];
          if (ele.userId == userId) {
            ele.userState = PLAYER_STATE.QUIT;
          }
        }
      }

      Logger.info(
        tableId,
        "leaveTableHandler :: After :: playerGamePlay :>",
        playerGamePlay
      );
      Logger.info(
        tableId,
        "leaveTableHandler :: After :: tableGamePlay :: ",
        tableGamePlay
      );

      await Promise.all([
        tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
        playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
      ]);
    }

    if (
      (tableGamePlay.tableState === TABLE_STATE.WINNER_DECLARED ||
        tableGamePlay.tableState === TABLE_STATE.SCORE_BOARD) &&
      !leaveTableData.isLeaveFromScoreBoard
    ) {
      if (!isLeaveEventSend) {
        await leaveClientInRoom(socketId, tableId);
      }
      return false;
    }
  } catch (error) {}
};
