import { IGetUserInput, IUserProfileOutput } from "../interfaces/userProfile";
import { userProfileCache } from "../cache";

const getUser = async (obj: IGetUserInput) => {
  try {
    const userProfileData = await userProfileCache.getUserProfile(obj._id);
    if (userProfileData) return userProfileData;

    if (userProfileData)
      await userProfileCache.setUserProfile(obj._id, userProfileData);

    return userProfileData as IUserProfileOutput | null;
  } catch (error) {}
};

export default { getUser };
