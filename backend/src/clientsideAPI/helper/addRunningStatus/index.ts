import Logger from "../../../logger";
import {
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../../cache";
import { PLAYER_STATE } from "../../../constants";
import { IUserProfileOutput } from "../../../interfaces/userProfile";
import addGameRunningStatus from "../../addGameRunningStatus";

const addRunningStatus = async (tableId: string) => {
  try {
    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
    ]);

    if (!tableConfig || !tableGamePlay) {
      throw Error("Unable to get data");
    }

    for (const ele of tableGamePlay.seats) {
      let userProfile = (await userProfileCache.getUserProfile(
        ele.userId
      )) as IUserProfileOutput;

      Logger.info(
        tableId,
        " roundStartTimer :: userProfile :: >> ",
        userProfile
      );

      if (
        ele.userState === PLAYER_STATE.PLAYING &&
        tableId === userProfile.tableId
      ) {
        const apiData = {
          tableId,
          tournamentId: userProfile.lobbyId,
          gameId: userProfile.gameId,
        };
        const addGameRunningDetail = await addGameRunningStatus(
          apiData,
          userProfile.authToken,
          userProfile.socketId,
          userProfile.userId
        );
      }
    }
    return true;
  } catch (error) {
    Logger.error(tableId, "CATCH_ERROR :addRunningStatus :: ", tableId, error);
    throw error;
  }
};

export default addRunningStatus;
