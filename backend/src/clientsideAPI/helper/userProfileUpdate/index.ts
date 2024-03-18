import getUserOwnProfile from "../../getUserOwnProfile";
import { IFindUser } from "../../../interfaces/signup";
import Logger from "../../../logger";
import { NUMERICAL } from "../../../constants";

const userProfileUpdate = async (
  userDetail: IFindUser,
  socketId: string
): Promise<any> => {
  const userId = userDetail.userId;
  try {
    const userOwnProfile = await getUserOwnProfile(
      userDetail.authToken,
      socketId,
      userId
    );

    Logger.info(userId, "userOwnProfile  :: >> ", userOwnProfile);
    Logger.info(
      userId,
      "userDetail  :: >> ",
      userDetail,
      "Number(userDetail.latitude) :: >> ",
      Number(userDetail.latitude),
      "Number(userDetail.longitude) :: ",
      Number(userDetail.longitude)
    );

    // Latitude, longitude, balance set in user profile
    let latitude: string = `${NUMERICAL.ZERO}`;
    let longitude: string = `${NUMERICAL.ZERO}`;

    if (
      Number(userDetail.latitude) == NUMERICAL.ZERO &&
      Number(userDetail.longitude) == NUMERICAL.ZERO
    ) {
      latitude = userDetail.latitude || "0.0";
      longitude = userDetail.longitude || "0.0";
    } else {
      latitude = userDetail.latitude;
      longitude = userDetail.longitude;
    }

    const balance: number = userOwnProfile.winCash + userOwnProfile.cash || 0;

    let updateUserQuery = {
      ...userDetail,
      latitude: latitude,
      longitude: longitude,
      balance: balance,
    };

    Logger.info(userId, "updateUserQuery :>>> ", updateUserQuery);
    return updateUserQuery;
  } catch (error) {
    Logger.error(
      userId,
      "CATCH_ERROR :userProfileUpdate :: ",
      userDetail,
      error
    );
    throw error;
  }
};

export default userProfileUpdate;
