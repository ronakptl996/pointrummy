import Logger from "../logger";

const verifyUserProfile = (
  token: string,
  gameId: string,
  socketId: string,
  userId: string
): any => {
  Logger.info(userId, "verifyUserProfile :: ", token, "gameId :: >", gameId);
  return true;

  // Verify user profile by Clent API
};

export default verifyUserProfile;
