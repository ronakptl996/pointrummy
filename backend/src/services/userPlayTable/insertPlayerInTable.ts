import Logger from "../../logger";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
} from "../../cache";
import { NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../constants";
import { defaultPlayerGamePlayData } from "../../defaultGenerator";
import { ISeats } from "../../interfaces/signup";
import { IInsertPlayerInTable } from "../../interfaces/playerGamePlay";

const insertPlayerInTable = async (
  userData: IUserProfileOutput,
  tableId: string
): Promise<IInsertPlayerInTable | null> => {
  const { id: userId, username, profilePic } = userData;

  try {
    Logger.info(
      tableId,
      `Starting insertPlayerInTable for tableId : ${tableId} and userId : ${userId}`
    );

    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
    ]);

    if (!tableConfig) throw Error("Unable to get Table Config Data");
    if (!tableGamePlay) throw Error("Unable to get Table Game Play");

    Logger.info(tableId, " tableGamePlay:get :::", tableGamePlay);

    const seatIndex = insertPlayerInSeat(tableGamePlay.seats, userId);
    const isSeatEmpty = checkIfSeatEmpty(seatIndex, tableGamePlay.seats);

    Logger.info(tableId, "seatIndex :: ", seatIndex);
    Logger.info(tableId, "isSeatEmpty :: ", isSeatEmpty);

    let userStatus: string = PLAYER_STATE.PLAYING;

    if (
      tableGamePlay &&
      tableGamePlay.tableState !== TABLE_STATE.WAITING_FOR_PLAYERS &&
      tableGamePlay.tableState !== TABLE_STATE.ROUND_TIMER_STARTED &&
      tableGamePlay.tableState !== TABLE_STATE.WAIT_FOR_OTHER_PLAYERS
    ) {
      userStatus = PLAYER_STATE.WATCHING;
    }

    let playerGamePlay;
    if (seatIndex !== NUMERICAL.MINUS_ONE && isSeatEmpty) {
      const seatObject: ISeats = {
        userId: userId,
        si: seatIndex,
        name: userData.username,
        pp: userData.profilePic,
        userState: userStatus,
      };

      Logger.info(tableId, "seatObject :: ", seatObject);

      tableGamePlay.seats.splice(seatIndex, 0, seatObject);

      if (userStatus == PLAYER_STATE.PLAYING) {
        tableGamePlay.currentPlayerInTable += NUMERICAL.ONE;
      }

      playerGamePlay = defaultPlayerGamePlayData(
        userId,
        seatIndex,
        username,
        profilePic,
        userStatus
      );

      await Promise.all([
        playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
        tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
      ]);

      Logger.info(
        tableId,
        `Ending insertPlayerInTable for tableId : ${tableId} and userId : ${userId}`
      );
    } else {
      // Player is already in a table
      playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(
        userId.toString(),
        tableId
      );

      if (!playerGamePlay) {
        playerGamePlay = defaultPlayerGamePlayData(
          userId,
          seatIndex,
          username,
          profilePic,
          userStatus
        );

        await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
      }
    }
    return { tableGamePlay, playerGamePlay, tableConfig };
  } catch (error: any) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} user ${userId} function insertPlayerInTable`
    );
    throw new Error("INTERNAL_ERROR_insertPlayerInTable()");
  }
};

// Insert Player in Seat
const insertPlayerInSeat = (seats: Array<ISeats>, userId: string): number => {
  try {
    console.log("SEATS >", seats);

    let seatIndex: number = NUMERICAL.MINUS_ONE;

    for (let i = 0; i < seats.length; i++) {
      console.log("INSIDE FOR LOOP >>");
      const seat: ISeats = seats[i];

      // found an empty place in array
      if (!seat) break;

      if (seat.si !== i) {
        return i;
      } else if (seat.userId === userId) {
        return seat.si;
      }
    }

    if (seatIndex === NUMERICAL.MINUS_ONE) {
      seatIndex = seats.length;
    }

    return seatIndex;
  } catch (error: any) {
    throw new Error(
      error && error.message && typeof error.message === "string"
        ? error.message
        : "insertPlayerInSeat error"
    );
  }
};

// Check is Seat is Empty
const checkIfSeatEmpty = (seatIndex: number, seats: Array<ISeats>): boolean => {
  for (let i = 0; i < seats.length; i++) {
    const seat = seats[i];

    if (seat.si === seatIndex) {
      return false;
    }
  }
  return true;
};

export default insertPlayerInTable;
