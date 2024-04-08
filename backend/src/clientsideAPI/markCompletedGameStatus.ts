import { IMarkCompletedGameStatus } from "../interfaces/common";
import Logger from "../logger";

const markCompletedGameStatus = async (
  data: IMarkCompletedGameStatus,
  token: string,
  socketId: string
) => {
  const tableId = data.tableId;
  Logger.info(tableId, "markCompletedGameStatus :: ", data, token);
  return true;

  //    Implement Client Side API
};

export default markCompletedGameStatus;
