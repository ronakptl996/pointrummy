import { ICheckBalance } from "../interfaces/common";
import Logger from "../logger";

const checkBalance = async (
  data: ICheckBalance,
  token: string,
  socketId: string,
  userId: string
) => {
  Logger.info(userId, "checkBalance ", data, token);
  return { userBalance: { isInsufficiantBalance: false } };

  // fetch Data Using clientAPI
};

export default checkBalance;
