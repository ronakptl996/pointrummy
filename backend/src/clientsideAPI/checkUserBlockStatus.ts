import Logger from "../logger";

const checkUserBlockStatus = async (
  tablePlayerIds: string[],
  token: string,
  socketId: string,
  tableId: string
) => {
  Logger.info(tableId, "checkUserBlockStatus :: ", tablePlayerIds, token);
  return false;

  // Check User Block status using client API
};

export default checkUserBlockStatus;
