import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { NUMERICAL } from "../../constants";
import { ISeats } from "../../interfaces/signup";
import { IDefaultBaseTable } from "../../interfaces/tableGamePlay";
import Logger from "../../logger";

const getAvailableTable = async (
  key: string,
  maximumSeat: number,
  tableID: string
): Promise<string> => {
  try {
    Logger.info(tableID, " maximumSeat ==>> ", maximumSeat, " KEY >>", key);

    let tableId = "";
    let fetchTableId = "";
    const defaultTableGamePlay: IDefaultBaseTable | null = {
      seats: [],
      tableState: "",
    };
    let tableGamePlay: IDefaultBaseTable | null = defaultTableGamePlay;
    let seats: ISeats[] = tableGamePlay.seats;

    let getTableQueueArr = await tableConfigCache.getTableFromQueue(key);
    Logger.info(tableID, "getTableQueueArr  BEFORE:::>> ", getTableQueueArr);

    if (getTableQueueArr) {
      fetchTableId = getTableQueueArr.tableId.splice(
        NUMERICAL.ZERO,
        NUMERICAL.ONE
      )[0];
    }

    Logger.info(tableID, "getTableQueueArr  AFTER:::>> ", getTableQueueArr);

    await tableConfigCache.setTableFromQueue(key, getTableQueueArr);

    if (fetchTableId) {
      tableGamePlay = await tableGamePlayCache.getTableGamePlay(fetchTableId);
      tableGamePlay = tableGamePlay || defaultTableGamePlay;
      seats = tableGamePlay.seats.filter((el: ISeats): string => el.userId);

      if (seats.length < maximumSeat) {
        tableId = fetchTableId;
        Logger.info(tableID, "tableId =::=>> ", tableId);
      }
    }

    return tableId;
  } catch (error: any) {
    Logger.error(tableID, "getAvailableTable error", error);
    throw new Error(
      error && error.message && typeof error.message === "string"
        ? error.message
        : "getAvailableTable error"
    );
  }
};

export default getAvailableTable;
