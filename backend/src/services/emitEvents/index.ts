import Logger from "../../logger";
import config from "../../config";
import { diffSeconds } from "../../common";
import { EVENT, NUMERICAL, TABLE_STATE } from "../../constants";
import { formatJoinTableData } from "../../formatResponseData";
import { IDefaultPlayerGamePlay } from "../../interfaces/playerGamePlay";
import {
  IDefaultTableConfig,
  IFormatedJTResponse,
  JTResponse,
} from "../../interfaces/tableConfig";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import formatJoinTableSeats from "../nextRound/helper/formatJoinTableSeats";
import { removeQueue } from "../common/queue";
import commonEventEmitter from "../../commonEventEmitter";

const {
  SECONDARY_TIMER,
  USER_TURN_TIMER,
  GAME_START_TIMER,
  NEXT_GAME_START_TIMER,
  WAIT_FOR_OTHER_PLAYER_TIMER,
} = config.getConfig();

const emitJoinTableEvent = async (
  tableId: string,
  tableGamePlay: IDefaultTableGamePlay,
  tableConfig: IDefaultTableConfig,
  userProfile: IUserProfileOutput,
  socketId: string,
  reconnect: boolean,
  playerGamePlay: IDefaultPlayerGamePlay
) => {
  try {
    const formatedJoinTableResponse: any = [];
    const userId = userProfile.id;

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const element = tableGamePlay.seats[i];

      let resFormat: JTResponse = await formatJoinTableData(
        element,
        reconnect,
        element.userState
      );

      formatedJoinTableResponse.push(resFormat);
    }

    let rTimer: number = NUMERICAL.THIRTY;

    if (tableGamePlay.tableState === TABLE_STATE.ROUND_STARTED) {
      if (tableGamePlay.isSeconderyTimer) {
        rTimer =
          diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) *
          NUMERICAL.THOUSAND;
        rTimer =
          Math.ceil(Number(SECONDARY_TIMER) - rTimer) / NUMERICAL.THOUSAND;
      } else {
        rTimer =
          diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) *
          NUMERICAL.THOUSAND;
        rTimer =
          Math.ceil(Number(USER_TURN_TIMER) - rTimer) / NUMERICAL.THOUSAND;
      }
    }

    let totalRoundTimer: number = NUMERICAL.MINUS_ONE;
    if (tableGamePlay.currentPlayerInTable > tableConfig.minPlayer) {
      if (tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED) {
        if (
          !tableGamePlay.isnextRound ||
          tableConfig.noOfPlayer === NUMERICAL.TWO
        ) {
          totalRoundTimer =
            diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) *
            NUMERICAL.THOUSAND;
          totalRoundTimer =
            Math.ceil(Number(GAME_START_TIMER) - totalRoundTimer) /
            NUMERICAL.THOUSAND;
        } else {
          totalRoundTimer =
            diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) *
            NUMERICAL.THOUSAND;
          totalRoundTimer =
            Math.ceil(Number(NEXT_GAME_START_TIMER) - totalRoundTimer) /
            NUMERICAL.THOUSAND;
        }
      } else if (tableGamePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS) {
        totalRoundTimer =
          diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) *
          NUMERICAL.THOUSAND;
        Logger.info(tableId, " before :: totalRoundTimer :: ", totalRoundTimer);
        totalRoundTimer =
          Math.ceil(Number(WAIT_FOR_OTHER_PLAYER_TIMER) - totalRoundTimer) /
          NUMERICAL.THOUSAND;
      }
      Logger.info(tableId, " FINAL totalRoundTimer >>", totalRoundTimer);
    }

    let isRemainSeconderyTurns = false;
    if (playerGamePlay.seconderyTimerCounts < NUMERICAL.FOUR) {
      isRemainSeconderyTurns = true;
    }

    const addJoinTableData = await formatJoinTableSeats(
      formatedJoinTableResponse,
      tableConfig.noOfPlayer,
      tableId
    );

    Logger.info(tableId, " addJoinTableData :: ==>>", addJoinTableData);

    if (formatedJoinTableResponse.length === tableConfig.noOfPlayer) {
      await removeQueue(tableId);
    }

    let formatedJTResponse: IFormatedJTResponse = {
      tableId,
      entryFee: tableConfig.entryFee,
      jointTable: addJoinTableData,
      tableState: tableGamePlay.tableState,
      totalRoundTimer,
      dealerPlayer: tableGamePlay.dealerPlayer,
      validDeclaredPlayerSI: tableGamePlay.validDeclaredPlayerSI,
      validDeclaredPlayer: tableGamePlay.validDeclaredPlayer,
      currentTurnSeatIndex: tableGamePlay.currentTurnSeatIndex,
      currentTurn: tableGamePlay.currentTurn,
      totalUserTurnTimer: tableConfig.userTurnTimer / NUMERICAL.THOUSAND,
      userTurnTimer: rTimer,
      totalUserSeconderyTimer: Number(SECONDARY_TIMER / NUMERICAL.THOUSAND),
      trumpCard: tableGamePlay.trumpCard,
      opendDeck: tableGamePlay.opendDeck,
      finishDeck: tableGamePlay.finishDeck,
      closedDeck: tableGamePlay.closedDeck,
      isSeconderyTimer: tableGamePlay.isSeconderyTimer,
      isRemainSeconderyTurns: isRemainSeconderyTurns,
    };
    Logger.info(tableId, " formatedJTResponse ::: ", formatedJTResponse);

    // Join Room
    commonEventEmitter.emit(EVENT.ADD_PLAYER_IN_TABLE, {
      socketId,
      data: { tableId, userId },
    });

    // Join Table Emit
    commonEventEmitter.emit(EVENT.JOIN_TABLE_SOCKET_EVENT, {
      tableId,
      data: formatedJTResponse,
    });

    return true;
  } catch (e: any) {
    Logger.error(tableId, "emitJoinTableEvent error", e);
    throw new Error(e);
  }
};

export { emitJoinTableEvent };
