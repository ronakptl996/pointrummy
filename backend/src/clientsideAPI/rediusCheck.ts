import Logger from "../logger";

const rediusCheck = async (
  gameId: string,
  token: string,
  socketId: string,
  tableId: string
): Promise<any> => {
  Logger.info(tableId, "rediusCheck :: ", gameId, token);
  return { isGameRadiusLocationOn: false };

  // Use client API to check redius
};

export default rediusCheck;
