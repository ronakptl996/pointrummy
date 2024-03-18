import Logger from "../logger";
import Lock from "../lock";
import Errors from "../errors";
import { NUMERICAL } from "../constants";
import { signUpFormator } from "../InputDataFormator";
import { ISignUpInput } from "../interfaces/signup";
import { INewGTIResponse } from "../interfaces/tableConfig";
import { createOrFindUser } from "../services/userPlayTable";
import { verifyUserProfile } from "../clientsideAPI";
import config from "../config";

const { MAXIMUM_TABLE_CREATE_LIMIT } = config.getConfig();

async function signUpHandler(
  socket: any,
  signUpData: ISignUpInput,
  isRejoinOrNewGame: boolean,
  ack?: any
) {
  // : Promise<INewGTIResponse | boolean | undefined>
  let lock: any = null;
  //   lock = await Lock.getLock().acquire([signUpData.lobbyId], 2000);

  const socketId = socket.id;

  try {
    console.log("signUpData >", signUpData);
    const userId = signUpData.userId;

    Logger.info(userId, "socket.authToken :: >>", socket.authToken);
    socket.userId = userId;

    // remove signUpType
    // let signUpType = signUpData.signUpType ? signUpData.signUpType : "";
    // delete signUpData.signUpType;

    // Signup Format Check
    const formatedSignUpData = await signUpFormator(signUpData);
    Logger.info(
      userId,
      " reqData : formatedSignupData :: ",
      formatedSignUpData
    );

    // Verify User Profile with Client API
    const isValidUserData = verifyUserProfile(
      socket.authToken,
      signUpData.gameId,
      socketId,
      userId
    );
    // Check Project Under Maintanance or NOT

    // Check User isFTUE
    if (signUpData.isFTUE) {
      // let FTUE = await firstTimeIntrection(signUpData.gameId, signUpData.gameModeId, socket.authToken, socketId, userId);
      signUpData.isFTUE = false;
    }

    Logger.info(
      userId,
      "isRejoinOrNewGame ==:>> ",
      isRejoinOrNewGame,
      "signUpData.tableId ===>>"
    );

    // Find or Create User
    const userSignUp = await createOrFindUser({
      socketId: socketId.toString(),
      userId: signUpData?.userId,
      lobbyId: signUpData?.lobbyId,
      gameId: signUpData?.gameId,
      username: signUpData?.userName,
      profilePic: signUpData.profilePic,
      entryFee: Number(Number(signUpData.entryFee) / NUMERICAL.EIGHTY),
      noOfPlayer: signUpData.noOfPlayer,
      gameType: signUpData.rummyType,
      isUseBot: signUpData.isUseBot,
      isFTUE: signUpData.isFTUE,
      authToken: socket.authToken || signUpData.accessToken,
      isAnyRunningGame:
        isValidUserData && isValidUserData.isValidUser
          ? isValidUserData.isAnyRunningGame
          : false,
      latitude: signUpData.latitude,
      longitude: signUpData.longitude,
    });

    if (!userSignUp) throw new Errors.UnknownError("USER_SIGNUP_FAILED");
    const userProfile = userSignUp.userProfile;
    Logger.info(userId, "userProfile :: >> ", userProfile);

    // User Seat in maximum number of tables
    Logger.info(
      userId,
      "  MAXIMUM_TABLE_CREATE_LIMIT  ::>> ",
      MAXIMUM_TABLE_CREATE_LIMIT,
      "userProfile.tableIds.length :>>",
      userProfile.tableIds.length
    );
  } catch (error) {}
}

export default signUpHandler;
