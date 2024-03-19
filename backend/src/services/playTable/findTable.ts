import Logger from "../../logger";
import { EMPTY, NUMERICAL } from "../../constants";
import { ICreateTable } from "../../interfaces/signup";
import { tableGamePlayCache, userProfileCache } from "../../cache";
import getAvailableTable from "./getAvailableTable";
import createTable from "./createTable";
import { setUpFirstRound } from "../round";

const findOrCreateTable = async (signUpData: ICreateTable): Promise<string> => {
  const userId = signUpData.userId;
  try {
    let tableId: string = EMPTY;
    const key = `${signUpData.lobbyId}`;
    Logger.info(
      userId,
      `Starting findOrCreateTable for userId : ${signUpData.userId}`
    );

    let userProfile = await userProfileCache.getUserProfile(signUpData.userId);

    if (!userProfile) throw new Error("Unable to get user profile");
    Logger.info(userId, "get userProfile : ==>> ", userProfile);

    const { oldTableId } = userProfile;

    // (IMPLEMENT) if OLD TABLE is exists!!
    if (userProfile && oldTableId.length !== NUMERICAL.ZERO) {
      Logger.info(userId, "oldTableId  :>> ", oldTableId);
    }

    Logger.info(userId, "tableId :: ==>> ", tableId, typeof tableId);

    if (!tableId) {
      tableId = await getAvailableTable(
        key,
        Number(signUpData.noOfPlayer),
        tableId
      );

      Logger.info(userId, "getAvailableTable : tableId ::", tableId);

      // user Exists In Previous Table check
      if (tableId) {
        let userExistsInPreviousTable = false;
        const tableGamePlay = await tableGamePlayCache.getTableGamePlay(
          tableId
        );
        if (!tableGamePlay) throw new Error("Unable to get table data");

        for (let i = 0; i < tableGamePlay.seats.length; i++) {
          const ele = tableGamePlay.seats[i];

          if (ele.userId == signUpData.userId) {
            userExistsInPreviousTable = true;
          }
        }

        Logger.info(
          userId,
          "userExistsInPreviousTable :>> ",
          userExistsInPreviousTable
        );

        // (IMPLEMENT) if tableId exists!!
      }
    }

    if (!tableId) {
      // Create Table
      tableId = await createTable(signUpData);
      Logger.info(userId, " createTable : tableId :: ", tableId);

      await setUpFirstRound({ tableId, gameType: signUpData.gameType });
    }
  } catch (error) {}

  return "";
};

export default findOrCreateTable;
