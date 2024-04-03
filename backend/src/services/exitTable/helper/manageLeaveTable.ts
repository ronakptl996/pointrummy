import Logger from "../../../logger";
import commonEventEmitter from "../../../commonEventEmitter";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../../cache";
import { NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import { ISeats } from "../../../interfaces/signup";

const manageLeaveTable = async (
  userId: string,
  tableId: string,
  socketId: string,
  isLeaveEventSend: boolean
) => {
  try {
    Logger.info(
      " manageLeaveTable :: Starting  :: userId  ::",
      userId,
      "tableId :: ",
      tableId,
      "socketId :: ",
      socketId,
      "isLeaveEventSend :: ",
      isLeaveEventSend
    );

    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) throw new Error("Unable to get table config");

    const [tableGamePlay, playerGamePlay, userProfile] = await Promise.all([
      tableGamePlayCache.getTableGamePlay(tableId),
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
      userProfileCache.getUserProfile(userId),
    ]);

    if (!tableGamePlay) throw new Error("Unable to get table game play");
    if (!playerGamePlay) throw new Error("Unable to get player game play");
    if (!userProfile) throw new Error("Unable to get user profile");

    Logger.info(
      tableId,
      " manageLeaveTable :: tableGamePlay ::",
      tableGamePlay
    );
    Logger.info(
      tableId,
      " manageLeaveTable :: playerGamePlay :: ",
      playerGamePlay
    );
    Logger.info(tableId, " manageLeaveTable :: userProfile :: ", userProfile);

    if (
      tableGamePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS ||
      tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
      tableGamePlay.tableState === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS ||
      (tableGamePlay.tableState === TABLE_STATE.COLLECTING_BOOT_VALUE &&
        playerGamePlay.userStatus !== PLAYER_STATE.WATCHING)
    ) {
      tableGamePlay.currentPlayerInTable -= NUMERICAL.ONE;

      Logger.info(
        tableId,
        " leaveTable ::> before ::> seats ::>",
        tableGamePlay.seats
      );

      const seats: ISeats[] = tableGamePlay.seats.filter(
        (seat: ISeats) => seat.userId !== playerGamePlay.userId
      );
      tableGamePlay.seats = seats;

      Logger.info(
        tableId,
        " leaveTable ::> after ::> seats ::>",
        tableGamePlay.seats
      );
      Logger.info(
        tableId,
        " tableGamePlay.currentPlayerInTable ==>",
        tableGamePlay.currentPlayerInTable
      );
      Logger.info(
        tableId,
        " tableGamePlay.tableState :: ",
        tableGamePlay.tableState
      );
    }
  } catch (error) {}
};
