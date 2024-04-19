import Logger from "../logger";
import Lock from "../lock";
import Errors from "../errors";
import {
  IEndDragCardInput,
  IEndDragCardResponse,
} from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableGamePlayCache } from "../cache";
import { EVENT, MESSAGES, NUMERICAL, TABLE_STATE } from "../constants";
import { endDragCardFormator } from "../InputDataFormator";
import manageAndUpdateData from "../utils/manageCardData";
import { formatEndDragCardData } from "../formatResponseData";
import commonEventEmitter from "../commonEventEmitter";

const endDragCardHandler = async (
  socket: any,
  endDragCard: IEndDragCardInput
) => {
  const socketId = socket.id;
  const userId = String(endDragCard.userId) || socket.userId;
  const tableId = String(endDragCard.tableId) || socket.tableId;

  let lock: any = null;

  try {
    let userCard: any;
    let userGroupIndex: any;
    let destinationGroupIndex: number = endDragCard.destinationGroupIndex;
    let cardIndexInGroup: number = endDragCard.cardIndexInGroup;

    endDragCard.cards.map((ele) => {
      userCard = ele.card;
      userGroupIndex = ele.groupIndex;
    });

    lock = await Lock.getLock().acquire([`${userId}`], 2000);

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);

    if (!tableGamePlay)
      throw new Errors.UnknownError("Unable to get table data");

    if (
      tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
      tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD
    ) {
      const formatedEndDragCardHandlerData = await endDragCardFormator(
        endDragCard
      );

      Logger.info(
        tableId,
        " reqData : formatedEndDragCardHandlerData ===>> ",
        formatedEndDragCardHandlerData
      );

      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(
        userId,
        tableId
      );

      if (!playerGamePlay)
        throw new Errors.UnknownError("Unable to get player data");

      let indexFind =
        playerGamePlay.currentCards[userGroupIndex].indexOf(userCard);

      if (indexFind != -1) {
        let spliceCard = playerGamePlay.currentCards[userGroupIndex].splice(
          indexFind,
          NUMERICAL.ONE
        );
        playerGamePlay.currentCards[destinationGroupIndex].splice(
          cardIndexInGroup,
          NUMERICAL.ZERO,
          spliceCard[NUMERICAL.ZERO]
        );
      }

      const result = playerGamePlay.currentCards.filter(
        (ele) => ele.length > NUMERICAL.ZERO
      );

      const { cards, playerGamePlayUpdated, totalScorePoint } =
        await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay);

      playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
      playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
      playerGamePlay.cardPoints = totalScorePoint;

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      const formatedEndDragCardData: IEndDragCardResponse =
        await formatEndDragCardData(
          playerGamePlay.userId,
          tableId,
          cards,
          totalScorePoint
        );

      Logger.info(
        tableId,
        "formatedEndDragCardData :: ",
        formatedEndDragCardData
      );

      commonEventEmitter.emit(EVENT.END_DRAG_SOCKET_EVENT, {
        socket: socketId,
        tableId: tableId,
        data: formatedEndDragCardData,
      });

      return true;
    }
  } catch (error: any) {
    Logger.error(tableId, `endDragCardHandler Error :: ${error}`);

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
      commonEventEmitter.emit(EVENT.END_DRAG_SOCKET_EVENT, {
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
      Logger.error(tableId, error, " endDragCardHandler ");
    }
  }
};

export default endDragCardHandler;
