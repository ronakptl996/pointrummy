import Logger from "../../logger";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../cache";
import { markCompletedGameStatus } from "../../clientsideAPI";
import commonEventEmitter from "../../commonEventEmitter";
import {
  EMPTY,
  EVENT,
  MESSAGES,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from "../../constants";
import Errors from "../../errors";
import cancelDeclarePlayerTurnTimer from "../../scheduler/cancelJob/declarePlayerTurnTimer.cancel";
import cancelPlayerTurnTimer from "../../scheduler/cancelJob/playerTurnTimer.cancel";
import cancelSeconderyTimer from "../../scheduler/cancelJob/secondaryTimer.cancel";
import nextTurnDelay from "../../scheduler/queues/nextTurnDelay.queue";
import { leaveClientInRoom } from "../../socket";
import { removeQueue, setQueue } from "../common/queue";
import { autoDiscard } from "../turn/helper";
import winnerHandler from "../winner";
import winnerAndScoreBoardManage from "../winner/helper/winnerAndScoreBoardManage";
import emitLeaveTableEvent from "./helper/emitLeaveTableEvent";
import manageLeaveTable from "./helper/manageLeaveTable";
import manageLeaveTableInWinnerDeclare from "./helper/manageLeaveTableInWinnerDeclare";

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
    } else if (
      tableGamePlay.tableState === TABLE_STATE.SCORE_BOARD ||
      tableGamePlay.tableState === TABLE_STATE.WINNER_DECLARED
    ) {
      await manageLeaveTableInWinnerDeclare(
        userId,
        tableId,
        socketId,
        isLeaveEventSend
      );
    } else if (
      tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
      tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD
    ) {
      Logger.info(
        tableId,
        " playerGamePlay.userStatus ::: ",
        playerGamePlay.userStatus
      );
      Logger.info(
        " tableGamePlay.currentPlayerInTable :::",
        tableGamePlay.currentPlayerInTable
      );

      if (tableGamePlay.currentPlayerInTable < NUMERICAL.TWO) {
        const { winnerUserId, winnerSI, allUserPGP, userArray } =
          await winnerAndScoreBoardManage(
            userId,
            tableId,
            tableGamePlay,
            tableConfig,
            PLAYER_STATE.LEAVE
          );

        Logger.info(
          tableId,
          " tableGamePlay.currentPlayerInTable : UPDATED ",
          tableGamePlay.currentPlayerInTable
        );

        tableGamePlay.tableState = TABLE_STATE.WINNER_DECLARED;
        await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

        for await (const player of tableGamePlay.seats) {
          await cancelPlayerTurnTimer(
            `${tableId}:${player.userId}:${tableConfig.currentRound}`,
            tableId
          );
          await cancelSeconderyTimer(
            `${tableId}:${player.userId}:${tableConfig.currentRound}`,
            tableId
          );
          await cancelDeclarePlayerTurnTimer(
            `declare:${tableId}:${player.userId}:${tableConfig.currentRound}`,
            tableId
          );
        }

        // user leave
        await emitLeaveTableEvent(
          tableId,
          playerGamePlay,
          userProfile,
          PLAYER_STATE.LEAVE,
          tableGamePlay.currentPlayerInTable,
          tableGamePlay.tableState,
          isLeaveEventSend,
          socketId
        );

        await winnerHandler(
          winnerUserId,
          winnerSI,
          tableId,
          allUserPGP,
          tableGamePlay,
          true
        );
      } else {
        // More than two Player
        Logger.info(tableId, "<<== More than two players ==>>");
        Logger.info(
          tableId,
          "leaveTable :: before :: tableGamePlay.seats :: >> ",
          tableGamePlay.seats
        );
        Logger.info(
          tableId,
          " tableGamePlay.currentPlayerInTable :: UPDATED",
          tableGamePlay.currentPlayerInTable
        );

        if (playerGamePlay.userStatus === PLAYER_STATE.WATCHING_LEAVE) {
          tableGamePlay.seats.filter((seat, index) => {
            if (seat.userId === userId) {
              tableGamePlay.seats.splice(index, NUMERICAL.ONE);
            }
          });

          await Promise.all([
            tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
            playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
          ]);

          await setQueue(tableId);
          await emitLeaveTableEvent(
            tableId,
            playerGamePlay,
            userProfile,
            PLAYER_STATE.WATCHING_LEAVE,
            tableGamePlay.currentPlayerInTable,
            tableGamePlay.tableState,
            isLeaveEventSend,
            socketId
          );
        } else {
          await emitLeaveTableEvent(
            tableId,
            playerGamePlay,
            userProfile,
            PLAYER_STATE.LEAVE,
            tableGamePlay.currentPlayerInTable,
            tableGamePlay.tableState,
            isLeaveEventSend,
            socketId
          );
        }

        Logger.info(
          tableId,
          "leaveTable :: after ::  tableGamePlay.seats :: >> ",
          tableGamePlay.seats
        );

        await Promise.all([
          tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
          await cancelDeclarePlayerTurnTimer(
            `declare:${tableId}:${playerGamePlay.userId}:${tableConfig.currentRound}`,
            tableId
          ),
        ]);

        if (
          tableGamePlay.tableState == TABLE_STATE.ROUND_STARTED &&
          userId == tableGamePlay.currentTurn
        ) {
          await cancelPlayerTurnTimer(
            `${tableId}:${playerGamePlay.userId}:${tableConfig.currentRound}`,
            tableId
          );
          await cancelSeconderyTimer(
            `${tableId}:${playerGamePlay.userId}:${tableConfig.currentRound}`,
            tableId
          );
          await nextTurnDelay({
            timer: NUMERICAL.ONE * NUMERICAL.ZERO,
            jobId: `nextTurn:${tableId}:${NUMERICAL.ONE}`,
            tableId,
          });
        }
      }
    } else {
      Logger.info(
        tableId,
        "leaveTable :: else call.. :: tableGamePlay.currentPlayerInTable ::>",
        tableGamePlay.currentPlayerInTable
      );

      if (tableGamePlay.currentPlayerInTable === NUMERICAL.ZERO) {
        for await (const player of tableGamePlay.seats) {
          await cancelPlayerTurnTimer(
            `${tableId}:${player.userId}:${tableConfig.currentRound}`,
            tableId
          );
          await cancelSeconderyTimer(
            `${tableId}:${player.userId}:${tableConfig.currentRound}`,
            tableId
          );
        }

        await removeQueue(tableId);
        await Promise.all([
          await tableGamePlayCache.deleteTableGamePlay(tableId),
          await tableConfigCache.deleteTableConfig(tableId),
        ]);
      }

      await emitLeaveTableEvent(
        tableId,
        playerGamePlay,
        userProfile,
        PLAYER_STATE.LEAVE,
        tableGamePlay.currentPlayerInTable,
        tableGamePlay.tableState,
        isLeaveEventSend,
        socketId
      );
    }

    userProfile.tableId = EMPTY;
    userProfile.tableIds = userProfile.tableIds.filter((el) => tableId != el);
    userProfile.tableId =
      userProfile.tableIds.length === 0
        ? EMPTY
        : userProfile.tableIds[NUMERICAL.ZERO];
    userProfile.oldTableId.push(tableId);

    Logger.info(
      tableId,
      "++++>> leaveTable :: >> userProfile.tableId",
      userProfile.tableId,
      "userProfile.tableIds :: >> ",
      userProfile.tableIds
    );
    Logger.info(
      tableId,
      "++++>> leaveTable :: userProfile.oldTableId ::=>>",
      userProfile.oldTableId
    );

    await userProfileCache.setUserProfile(userId, userProfile);

    if (socketId) {
      await leaveClientInRoom(socketId, tableId);
    }

    // Mark Completed Game Status
    await markCompletedGameStatus(
      {
        tableId,
        gameId: userProfile.gameId,
        tournamentId: userProfile.lobbyId,
      },
      userProfile.authToken,
      socketId
    );

    Logger.info(
      tableId,
      `Ending leaveTable for tableId : ${tableId} and userId : ${userId}`
    );

    return true;
  } catch (error) {
    Logger.error(tableId, `INTERNAL_ERROR_leaveTable Error :: ${error}`);
    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;
    nonProdMsg = "FAILED";
    if (error instanceof Errors.UnknownError) {
      commonEventEmitter.emit(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: msg,
          tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    }

    throw new Error(`INTERNAL_ERROR_leaveTable Error :: ${error}`);
  }
};

export default leaveTable;
