import Logger from "../logger";

const getUserOwnProfile = async (
  token: string,
  socketId: string,
  userId: string
): Promise<any> => {
  Logger.info(userId, "getUserOwnProfile :: ", token);
  return { coins: 1000, winCash: 1000, cash: 1000 };

  // Use API for get user profile details
};

export default getUserOwnProfile;
