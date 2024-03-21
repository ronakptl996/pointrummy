import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../cache";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import { INewGTIResponse } from "../../interfaces/tableConfig";
import Logger from "../../logger";
import {
  formateRejoinTableData,
  formateUpdatedGameTableData,
} from "../../formatResponseData";

const formatingSignUpResData = async (
  userId: string,
  isRejoinCall: boolean = false
) => {
  try {
    const userProfileData: IUserProfileOutput | null =
      await userProfileCache.getUserProfile(userId);

    Logger.info(
      userId,
      "userProfileData :: ",
      userProfileData,
      "userProfileData.tableIds.length ::>> ",
      userProfileData?.tableIds.length
    );

    const gameTableInfoData = <INewGTIResponse[]>[];
    const currentGameTableInfoData = <INewGTIResponse[]>[];

    if (userProfileData) {
      for (let i = 0; i < userProfileData.tableIds.length; i++) {
        const tableId = userProfileData.tableIds[i];

        const [tableGamePlayData, tableConfigData, playerGamePlayData] =
          await Promise.all([
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId),
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
          ]);

        if (!tableGamePlayData || !tableConfigData || !playerGamePlayData) {
          Logger.info(
            userId,
            `++++++++++++++++++++++++++++++++++++++++++ Could not find table and user data +++++++++++++++++++++++++++++++++++++++++++++++++++++++++>>`
          );
          continue;
        }

        // REJOIN
        let formatedGTIResponse: INewGTIResponse;
        if (isRejoinCall) {
          formatedGTIResponse = await formateRejoinTableData(
            tableConfigData,
            tableGamePlayData,
            playerGamePlayData
          );
        } else {
          formatedGTIResponse = await formateUpdatedGameTableData(
            tableConfigData,
            tableGamePlayData,
            playerGamePlayData
          );
        }
        gameTableInfoData.push(formatedGTIResponse);
        if (userProfileData.tableId == tableId) {
          currentGameTableInfoData.push(formatedGTIResponse);
        }
      }
    }
    Logger.info(userId, "gameTableInfoData ============>> ", gameTableInfoData);
    Logger.info(
      userId,
      "currentGameTableInfoData ============>> ",
      currentGameTableInfoData
    );

    return { gameTableInfoData, currentGameTableInfoData };
  } catch (error: any) {
    Logger.error(userId, "formatingSignUpResData :: ERROR :: >>", error);
    throw error;
  }
};

export default formatingSignUpResData;
