import Logger from "../../logger";
import userProfileUpdate from "../../clientsideAPI/helper/userProfileUpdate";
import { IFindUser } from "../../interfaces/signup";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import { findOrCreateUser } from "../signUp";

const createOrFindUser = async (formatedSignUpData: IFindUser) => {
  const userId = formatedSignUpData.userId;
  try {
    const updatedSignupData = await userProfileUpdate(
      formatedSignUpData,
      formatedSignUpData.socketId
    );

    console.log("updatedSignupData === >>>", updatedSignupData);

    const userProfile: IUserProfileOutput = await findOrCreateUser(
      updatedSignupData
    );

    return {
      userProfile,
      signUpData: formatedSignUpData,
    };
  } catch (error: any) {
    Logger.error(userId, "createOrFindUser ERROR ", error);
  }
};

export default createOrFindUser;
