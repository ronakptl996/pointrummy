import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../cache";
import { PLAYER_STATE } from "../../constants";

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
          // (IMP) manageAndUpdateData
        }
      }
    }
  } catch (error) {}
};
