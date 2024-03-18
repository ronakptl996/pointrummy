import Joi from "joi";
import { REDIS } from "../../constants";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import redis from "../redisCommon";
import Logger from "../../logger";
import profileService from "../../db";

const getUserProfile = async (
  userId: string
): Promise<IUserProfileOutput | null> => {
  const key = `${REDIS.USER}:${userId}`;
  try {
    const userProfile = await redis.getValueFromKey<IUserProfileOutput>(key);

    if (userProfile)
      Joi.assert(userProfile, profileService.UserProfile.joiSchema());
    return userProfile;
  } catch (error) {
    Logger.error(userId, `Error in getUserProfile for key ${key}`, error);
    throw new Error("get value error getUserProfile");
  }
};

const setUserProfile = async (
  userId: string,
  obj: IUserProfileOutput
): Promise<boolean> => {
  const key = `${REDIS.USER}:${userId}`;
  try {
    Joi.assert(obj, profileService.UserProfile.joiSchema());
    await redis.setValueInKey(key, obj);
    return true;
  } catch (error) {
    Logger.error(
      userId,
      `Error in setUserProfile for key ${key} and object ${JSON.stringify(
        obj
      )}`,
      error
    );
    throw new Error("set value key error");
  }
};

export default { getUserProfile, setUserProfile };
