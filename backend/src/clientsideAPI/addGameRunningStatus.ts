import Logger from "../logger";
import { IAddGameRunningStatus } from "../interfaces/common";

const addGameRunningStatus = async (
  data: IAddGameRunningStatus,
  token: string,
  socketId: string,
  userId: string
) => {
  Logger.info(userId, "addGameRunningStatusDetail ", data, token);
  return true;

  // Implement Game Running Status using client API
};

export default addGameRunningStatus;
