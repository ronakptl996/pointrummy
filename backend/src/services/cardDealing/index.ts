import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../cache";
import { EVENT, PLAYER_STATE, TABLE_STATE } from "../../constants";
import manageAndUpdateData from "../../utils/manageCardData";
import {
  IFormateProvidedCards,
  IManageAndUpdateData,
} from "../../interfaces/round";
import { formatProvidedCards } from "../../formatResponseData";

const cardDealing = async (tableId: string, currentRound: number) => {
  try {
    Logger.info(
      tableId,
      `Starting cardDealing for tableId : ${tableId} and round : ${currentRound}`
    );

    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
    ]);

    if (!tableGamePlay || !tableConfig) throw Error("Unable to get data");

    Logger.info(tableId, "cardDealing :: tableGamePlay  ==>>", tableGamePlay);

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const ele = tableGamePlay.seats[i];
      if (ele.userState === PLAYER_STATE.PLAYING) {
        const [playerGamePlay, userProfile] = await Promise.all([
          await playerGamePlayCache.getPlayerGamePlay(
            tableGamePlay.seats[i].userId.toString(),
            tableId
          ),
          userProfileCache.getUserProfile(tableGamePlay.seats[i].userId),
        ]);

        if (!playerGamePlay || !userProfile) {
          throw Error(":: Unable to get data card dealing :: ");
        }

        Logger.info(
          tableId,
          " playerGamePlay.userStatus ::: ",
          playerGamePlay.userStatus
        );
        Logger.info(tableId, "userProfile :: ", userProfile);

        if (playerGamePlay.userStatus === PLAYER_STATE.PLAYING) {
          const {
            cards,
            totalScorePoint,
            playerGamePlayUpdated,
          }: IManageAndUpdateData = await manageAndUpdateData(
            playerGamePlay.currentCards,
            playerGamePlay
          );

          const formatedProvidedCardData: IFormateProvidedCards =
            await formatProvidedCards(
              tableId,
              playerGamePlay.userId,
              tableGamePlay.closedDeck,
              tableGamePlay.opendDeck,
              tableGamePlay.trumpCard,
              cards
            );

          commonEventEmitter.emit(EVENT.PROVIDED_CARDS_EVENT, {
            socket: userProfile.socketId,
            data: formatedProvidedCardData,
            tableId,
          });

          playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
          playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
          playerGamePlay.cardPoints = totalScorePoint;
        }
        await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
      }

      tableGamePlay.tableState = TABLE_STATE.START_DEALING_CARD;

      await Promise.all([
        tableConfigCache.setTableConfig(tableId, tableConfig),
        tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
      ]);
    }

    Logger.info(
      tableId,
      `Ending cardDealing for tableId : ${tableId} and round : ${currentRound}`
    );

    return true;
  } catch (error) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} round ${currentRound} function cardDealing `
    );
    Logger.info(
      tableId,
      "==== INTERNAL_ERROR_cardDealing() ==== Error:",
      error
    );
    throw new Error(`INTERNAL_ERROR_cardDealing() ${error} `);
  }
};

export default cardDealing;
