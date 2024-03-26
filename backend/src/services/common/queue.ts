import Logger from "../../logger";
import { tableConfigCache } from "../../cache";
import { IDefaultTableConfig } from "../../interfaces/tableConfig";
import { NUMERICAL } from "../../constants";

const removeQueue = async (tableId: string) => {
  try {
    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    const key = `${tableConfig?.lobbyId}`;

    const queue: { tableId: Array<string> } =
      await tableConfigCache.getTableFromQueue(key);
    Logger.info(tableId, "removeQueue :: queue :: before >> ", queue);
    const queueTableId = queue.tableId.filter((t) => {
      return t === tableId;
    });

    if (queueTableId.length > NUMERICAL.ZERO) {
      for await (const tableID of queueTableId) {
        const queueIndex = queue.tableId.findIndex((t) => {
          return t === tableID;
        });
        if (queueIndex != NUMERICAL.MINUS_ONE) {
          queue.tableId.splice(queueIndex, NUMERICAL.ONE);
        }
      }
      Logger.info(tableId, "removeQueue :: queue :: after >> ", queue);
      await tableConfigCache.setTableFromQueue(key, queue);
    }
  } catch (error) {
    Logger.info(tableId, "---- removeQueue :: ERROR :: " + error);
    throw error;
  }
};

export { removeQueue };
