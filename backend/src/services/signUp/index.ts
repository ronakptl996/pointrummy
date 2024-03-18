import { userProfile } from "../../utils";
import { IUserProfileDataInput } from "../../interfaces/userProfile";
import Logger from "../../logger";
import { defaultUserProfile } from "../../defaultGenerator";
import { userProfileCache } from "../../cache";

const findOrCreateUser = async (userData: IUserProfileDataInput) => {
  const { userId } = userData;

  try {
    Logger.info(userId, `Starting findOrCreateUser for userId : ${userId}`);

    let userProfileData = await userProfile.getUser({ _id: userId });
    Logger.info(userId, " get-userProfileData :: ", userProfileData);

    // (IMPLEMENT) if userProfileData
    if (userProfileData) {
      //
    } else {
      // Default User Profile
      const userProfileDefault = await defaultUserProfile(userData);
      userProfileData = userProfileDefault;
    }

    await userProfileCache.setUserProfile(userProfileData.id, userProfileData);

    Logger.info(
      userId,
      `Ending findOrCreateUser for userId : ${userId}`,
      JSON.stringify(userProfileData)
    );

    return userProfileData;
  } catch (error: any) {
    Logger.error(
      userId,
      error,
      ` user ${userId} function findOrCreateUser ERROR`
    );
    throw error;
  }
};

export { findOrCreateUser };
