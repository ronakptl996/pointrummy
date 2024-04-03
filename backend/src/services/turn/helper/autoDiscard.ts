import { playerGamePlayCache, tableGamePlayCache } from "../../../cache";
import commonEventEmitter from "../../../commonEventEmitter";
import { EMPTY, EVENT, NUMERICAL } from "../../../constants";
import { formatDiscardCardData } from "../../../formatResponseData";
import { IDiscardCardRes } from "../../../interfaces/inputOutputDataFormator";
import { IDefaultPlayerGamePlay } from "../../../interfaces/playerGamePlay";
import { IDefaultTableGamePlay } from "../../../interfaces/tableGamePlay";
import Logger from "../../../logger";
import manageAndUpdateData from "../../../utils/manageCardData";
import selectCardToThrowOnTurnExpire from "../../cardThrow";
import { updateTurnHistory } from "../../turnHistory";

const autoDiscard = async (
  userId: string,
  tableId: string,
  currentRound: number,
  playerGamePlay: IDefaultPlayerGamePlay,
  tableGamePlay: IDefaultTableGamePlay
) => {
  try {
    let throwCardOnTimeOut: string = await selectCardToThrowOnTurnExpire(
      playerGamePlay
    );

    Logger.info(tableId, " throwCardOnTimeOut :: ", throwCardOnTimeOut);

    const result = playerGamePlay.currentCards.filter(
      (ele) => ele.length > NUMERICAL.ZERO
    );
    playerGamePlay.currentCards = result;

    Logger.info(
      tableId,
      " playerGamePlay currentCards length ==>>",
      playerGamePlay.currentCards
    );

    const { cards, totalScorePoint, playerGamePlayUpdated } =
      await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay);

    await updateTurnHistory(
      tableId,
      currentRound,
      throwCardOnTimeOut,
      playerGamePlay,
      true
    );

    playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
    playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
    playerGamePlay.cardPoints = totalScorePoint;
    playerGamePlay.pickFromDeck = EMPTY;
    playerGamePlay.tCount++;
    tableGamePlay.opendDeck.unshift(throwCardOnTimeOut);
    tableGamePlay.updatedAt = new Date().toString();
    tableGamePlay.discardedCardsObj = [
      {
        userId: userId,
        card: throwCardOnTimeOut,
        seatIndex: playerGamePlay.seatIndex,
      },
    ];

    await Promise.all([
      playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
      tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
    ]);

    const formatedDiscardCardData: IDiscardCardRes =
      await formatDiscardCardData(
        playerGamePlay.userId,
        playerGamePlay.seatIndex,
        tableId,
        cards,
        totalScorePoint,
        tableGamePlay.opendDeck
      );

    Logger.info(
      tableId,
      "Auto Discard : formatedDiscardCardData ::: ",
      formatedDiscardCardData
    );

    commonEventEmitter.emit(EVENT.DISCARD_CARD_SOCKET_EVENT, {
      tableId: tableId,
      data: formatedDiscardCardData,
    });

    return true;
  } catch (error) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} round ${currentRound} funciton autoDiscard`
    );
    throw new Error(`INTERNAL_ERROR_autoDiscard() ${error}`);
  }
};

export default autoDiscard;
