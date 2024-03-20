import Logger from "../../logger";
import { EMPTY, NUMERICAL } from "../../constants";
import { ICreateTable } from "../../interfaces/signup";
import { IBlockUserCheck } from "../../interfaces/common";
import { ITableQueue } from "../../interfaces/tableConfig";
import getAvailableTable from "./getAvailableTable";
import createTable from "./createTable";
import { setUpFirstRound } from "../round";
import blockUserCheck from "../blockUserCheck";
import {
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../cache";
import redis from "../../cache/redisCommon";
import { rediusCheck } from "../../clientsideAPI";
import { locationDistanceCheck } from "../locationCheck";

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
    } else {
      // Blocking User Check
      let blockUserData: IBlockUserCheck | null = await blockUserCheck(
        tableId,
        signUpData,
        key
      );

      if (!blockUserData) throw new Error(`Could not block user`);

      Logger.info(`blockUserData :: >>`, blockUserData);
      tableId = blockUserData.tableId;

      // Push key into redis
      let blockUserKey = `blockUserCheck:${signUpData.lobbyId}`;
      let blockUserArr: any = await redis.getValueFromKey(blockUserKey);
      Logger.info("Block User : getBlockUserArr", blockUserArr);

      if (blockUserArr && blockUserArr.tableId.length > NUMERICAL.ZERO) {
        for (let i = 0; i < blockUserArr.tableId.length; i++) {
          let key = `${signUpData.lobbyId}`;
          let getTableQueueArr: ITableQueue =
            await tableConfigCache.getTableFromQueue(key);

          let arrayData =
            getTableQueueArr && getTableQueueArr.tableId
              ? getTableQueueArr.tableId
              : [];

          arrayData.push(blockUserArr.tableId[i]);

          await tableConfigCache.setTableFromQueue(key, { tableId: arrayData });
        }
        await redis.deleteKey(blockUserKey);
      }

      Logger.info(" blockUserCheck ==>> after", tableId);

      // Location Check or radius check
      if (!blockUserData.isNewTableCreated) {
        const rediusCheckData = await rediusCheck(
          signUpData.gameId,
          signUpData.authToken,
          userProfile.socketId,
          tableId
        );

        Logger.info("userData.isUseBot  ==>>>", signUpData.isUseBot);

        if (rediusCheckData) {
          let rangeRediusCheck: number = parseFloat(
            rediusCheckData.LocationRange
          );
          if (
            rediusCheckData &&
            rediusCheckData.isGameRadiusLocationOn &&
            rediusCheckData != NUMERICAL.ZERO &&
            signUpData.isUseBot == false
          ) {
            Logger.info("locationDistanceCheck=====>>before", tableId);

            tableId = await locationDistanceCheck(
              tableId,
              signUpData,
              key,
              rangeRediusCheck
            );

            // push key into redis
            let locationKey = `LocationCheck:${signUpData.lobbyId}`;
            let getLocationArr: any = await redis.getValueFromKey(locationKey);

            if (
              getLocationArr &&
              getLocationArr.tableId.length > NUMERICAL.ZERO
            ) {
              for (let i = 0; i < getLocationArr.tableId.length; i++) {
                let key = `${signUpData.lobbyId}`;
                let getTableQueueArr: ITableQueue =
                  await tableConfigCache.getTableFromQueue(key);
                let arrayData =
                  getTableQueueArr && getTableQueueArr.tableId
                    ? getTableQueueArr.tableId
                    : [];
                arrayData.push(getLocationArr.tableId[i]);
                await tableConfigCache.setTableFromQueue(key, {
                  tableId: arrayData,
                });
              }
              await redis.deleteKey(locationKey);
            }
            Logger.info("locationDistanceCheck=====>>after", tableId);
          }
        }
      }
    }

    Logger.info(
      userId,
      `Ending findOrCreateTable for userId : ${signUpData.userId} and tableId : ${tableId}`
    );

    return tableId;
  } catch (error: any) {
    Logger.error(userId, `Error in findOrCreateTable`, error);
    throw new Error(
      error && error.message && typeof error.message === "string"
        ? error.message
        : `Error in findOrCreateTable`
    );
  }
};

export default findOrCreateTable;
