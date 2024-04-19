import Logger from "../logger";
import Lock from "../lock";
import Errors from "../errors";
import {
  IFinishInput,
  IFinishResponse,
} from "../interfaces/inputOutputDataFormator";
import {
  EMPTY,
  EVENT,
  MESSAGES,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from "../constants";
import { finishFormator } from "../InputDataFormator";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
} from "../cache";
import manageAndUpdateData from "../utils/manageCardData";
import { IManageAndUpdateData } from "../interfaces/round";
import { formatFinishStartUserTurn } from "../formatResponseData";
import commonEventEmitter from "../commonEventEmitter";
import cancelPlayerTurnTimer from "../scheduler/cancelJob/playerTurnTimer.cancel";
import cancelSeconderyTimer from "../scheduler/cancelJob/secondaryTimer.cancel";
import declarePlayerTurnTimer from "../scheduler/queues/declarePlayerTurnTimer.queue";

const finishHandler = async (socket: any, finishData: IFinishInput) => {
  const socketId = socket.id;
  const userId = String(finishData.tableId) || socket.userId;
  const tableId = String(finishData.tableId) || socket.tableId;

  let lock: any = null;

  try {
    let userFinishCard: string = EMPTY;
    finishData.finishCard.map((ele) => {
      userFinishCard = ele.card;
    });

    const formatedFinishData = await finishFormator(finishData);

    Logger.info(
      tableId,
      " reqData : formatedFinishData ===>> ",
      formatedFinishData
    );

    lock = await Lock.getLock().acquire([`${tableId}`], 2000);

    const [playerGamePlay, tableGamePlay, tableConfig] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      tableConfigCache.getTableConfig(tableId),
    ]);

    if (!playerGamePlay)
      throw new Errors.UnknownError("Unable to get player data");
    if (!tableGamePlay)
      throw new Errors.UnknownError("Unable to get table data");
    if (!tableConfig)
      throw new Errors.UnknownError("Unable to get table config data");

    if (
      tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
      tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD
    ) {
      const currentCardsLengthCheck: string[] = [];
      playerGamePlay.currentCards.map((ele) => {
        ele.map((e: string) => {
          currentCardsLengthCheck.push(e);
        });
      });

      if (currentCardsLengthCheck.length == NUMERICAL.FOURTEEN) {
        let finishCard = <string[]>[];
        playerGamePlay.currentCards.map((cards: string[]) => {
          cards.map((card: string, ind: number) => {
            if (card == userFinishCard) {
              cards.splice(ind, NUMERICAL.ONE);
              finishCard.push(card);
            }
          });
        });

        const result = playerGamePlay.currentCards.filter(
          (ele) => ele.length > NUMERICAL.ZERO
        );
        playerGamePlay.currentCards = result;

        Logger.info(tableId, " finishCard ====>>", finishCard);
        tableGamePlay.finishDeck.unshift(finishCard[NUMERICAL.ZERO]);

        const {
          cards,
          totalScorePoint,
          playerGamePlayUpdated,
        }: IManageAndUpdateData = await manageAndUpdateData(
          playerGamePlay.currentCards,
          playerGamePlay
        );

        playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
        playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
        playerGamePlay.cardPoints = totalScorePoint;
        playerGamePlay.userStatus = PLAYER_STATE.DECLAREING;

        for (let i = 0; i < tableGamePlay.seats.length; i++) {
          const ele = tableGamePlay.seats[i];
          if (ele.userId == userId) {
            ele.userState = PLAYER_STATE.DECLAREING;
          }
        }

        tableGamePlay.declareingPlayer = userId;
        tableGamePlay.tableState = TABLE_STATE.DECLAREING;
        var userSeatIndex: number = NUMERICAL.ZERO;
        tableGamePlay.seats.map((ele, ind) => {
          if (ele.userId == userId) {
            userSeatIndex = ele.si;
          }
        });
        tableGamePlay.currentTurnSeatIndex = userSeatIndex;
        tableGamePlay.updatedAt = new Date().toString();

        const currentTime = new Date();
        tableGamePlay.tableCurrentTimer = new Date(
          currentTime.setSeconds(
            currentTime.getSeconds() + Number(tableConfig.userTurnTimer)
          )
        );

        await Promise.all([
          playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
          tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
        ]);

        const formatedFinishResData: IFinishResponse =
          await formatFinishStartUserTurn(
            tableConfig.declareTimer,
            userId,
            userSeatIndex,
            cards,
            totalScorePoint,
            tableGamePlay.finishDeck,
            tableId
          );

        Logger.info(
          tableId,
          "formatedFinishResData :: ",
          formatedFinishResData
        );

        commonEventEmitter.emit(EVENT.FINISH_SOCKET_EVENT, {
          tableId: tableId,
          data: formatedFinishResData,
        });

        let nonProdMsg = "declareing timer start";
        commonEventEmitter.emit(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
          socket: socketId,
          data: {
            isPopup: true,
            popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOP_TOAST_POPUP,
            title: nonProdMsg,
            message: MESSAGES.ERROR.PLEASE_GROUP_YOUR_CARDS_AND_DECLARE,
            showTimer: false,
            tableId,
          },
        });

        const declareData = {
          userId: userId,
          tableId: tableId,
          currentRound: finishData.currentRound,
        };

        await cancelPlayerTurnTimer(
          `${tableId}:${playerGamePlay.userId}:${tableConfig.currentRound}`,
          tableId
        );

        await cancelSeconderyTimer(
          `${tableId}:${playerGamePlay.userId}:${tableConfig.currentRound}`,
          tableId
        );

        await declarePlayerTurnTimer({
          timer: tableConfig.declareTimer,
          jobId: `declare:${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,
          data: declareData,
        });
      } else {
        Logger.error(
          `There is some error at finishCard request data for user ${userId}`
        );
        throw new Errors.UnknownError("some error at finishCard");
      }
      return true;
    }
  } catch (error: any) {
    Logger.error(`finishHandler Error :>>: ${error}`);

    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;

    if (error instanceof Errors.InvalidInput) {
      nonProdMsg = "Invalid Input";
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
    } else if (error instanceof Errors.UnknownError) {
      nonProdMsg = "FAILED";

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
    } else {
      commonEventEmitter.emit(EVENT.FINISH_SOCKET_EVENT, {
        socket: socketId,
        data: {
          success: false,
          error: {
            errorCode,
            errorMessage:
              error && error.message && typeof error.message === "string"
                ? error.message
                : nonProdMsg,
          },
        },
      });
    }
  } finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(error, " finishHandler ");
    }
  }
};

export default finishHandler;
