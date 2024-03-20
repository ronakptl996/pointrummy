import { tableConfigCache, tableGamePlayCache } from "../../cache";
import redis from "../../cache/redisCommon";
import { checkUserBlockStatus } from "../../clientsideAPI";
import { EMPTY, NUMERICAL } from "../../constants";
import { IBlockUserCheck } from "../../interfaces/common";
import { ICreateTable } from "../../interfaces/signup";
import Logger from "../../logger";
import createTable from "../playTable/createTable";
import getAvailableTable from "../playTable/getAvailableTable";
import { setUpFirstRound } from "../round";

const blockUserCheck = async (
  tableId: string,
  signUpData: ICreateTable,
  key: string
): Promise<IBlockUserCheck | null> => {
  try {
    Logger.info(
      tableId,
      "Starting block user check : >> tableId :: >>",
      tableId,
      "signUpData :: >>",
      signUpData,
      "key :: >>",
      key
    );

    const [tableGamePlay, tableConfig] = await Promise.all([
      await tableGamePlayCache.getTableGamePlay(tableId),
      await tableConfigCache.getTableConfig(tableId),
    ]);

    if (!tableConfig) throw Error("Unable to get table config data");
    if (!tableGamePlay) throw new Error("Unable to get table data");

    let isNewTableCreated = false;
    let tbId = tableId;
    let newTableId: string = EMPTY;
    const { seats } = tableGamePlay;
    let blockUserKey = `blockUserCheck:${signUpData.lobbyId}`;
    let activePlayerUserIdArray = <string[]>[];

    for (const player of seats) {
      activePlayerUserIdArray.push(player.userId);
    }
    Logger.info(
      tableId,
      "activePlayerUserIdArray ::>>",
      activePlayerUserIdArray
    );

    if (tableGamePlay.seats.length >= NUMERICAL.ONE) {
      for (const player of seats) {
        // Redis Block user key setup
        let getBlockArr: any = await redis.getValueFromKey(blockUserKey);
        let arrayData =
          getBlockArr && getBlockArr.tableId ? getBlockArr.tableId : [];
        arrayData.push(tbId);

        Logger.info(tableId, " arrayData ==>> ", arrayData);
        await redis.setValueInKey(blockUserKey, { tableId: arrayData });

        let isUserBlock = await checkUserBlockStatus(
          activePlayerUserIdArray,
          signUpData.authToken,
          signUpData.socketId,
          tableId
        );

        Logger.info(tableId, "isUserBlock ::>>", isUserBlock);

        if (isUserBlock) {
          // find other empty table, if not available table then create a new one;
          newTableId = await getAvailableTable(
            newTableId,
            signUpData.noOfPlayer,
            key
          );

          Logger.info(tableId, " newTableId :>> ", newTableId);

          if (newTableId) {
            return await blockUserCheck(newTableId, signUpData, key);
          } else {
            Logger.info(tableId, "CREATE TABLE ==>>");
            let newCreateTableId: string = await createTable(signUpData);
            await setUpFirstRound({
              tableId: newCreateTableId,
              gameType: signUpData.gameType,
            });
            Logger.info(tableId, "newCreateTableId 1 :: ", newCreateTableId);
            tbId = newCreateTableId;
            isNewTableCreated = true;
          }
        } else {
          Logger.info(tableId, "not a blocking user :: working");

          let getBlockArr: any = await redis.getValueFromKey(blockUserKey);
          Logger.info(tableId, " getBlockArr =>", getBlockArr);

          let arrayData =
            getBlockArr && getBlockArr.tableId ? getBlockArr.tableId : [];

          Logger.info(
            tableId,
            " arrayData :: =>",
            arrayData,
            "index of array",
            arrayData.indexOf(tbId)
          );

          arrayData.splice(arrayData.indexOf(tbId), 1);
          await redis.setValueInKey(blockUserKey, { tableId: arrayData });
        }
      }
    }
    Logger.info(tableId, "tbId of From =>", tbId);
    return { tableId: tbId, isNewTableCreated };
  } catch (error) {
    Logger.info(tableId, " blockUserCheck() :: ERROR ==>>", error);
    return null;
  }
};

export default blockUserCheck;
