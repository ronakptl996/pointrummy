import Logger from "../logger";
import Lock from "../lock";
import Errors from "../errors";
import { EMPTY, EVENT, MESSAGES, NUMERICAL } from "../constants";
import { signUpFormator } from "../InputDataFormator";
import { ISignUpInput } from "../interfaces/signup";
import { INewGTIResponse } from "../interfaces/tableConfig";
import { tableGamePlayCache, userProfileCache } from "../cache";
import { createOrFindUser, findTableForUser } from "../services/userPlayTable";
import formatingSignUpResData from "../services/signUp/formatingSignUpResData";
import { checkBalance, verifyUserProfile } from "../clientsideAPI";
import config from "../config";
import commonEventEmitter from "../commonEventEmitter";
import { formatSignUpData } from "../formatResponseData";
import { ackEvent } from "../utils";

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

    if (userProfile.tableIds.length >= MAXIMUM_TABLE_CREATE_LIMIT) {
      Logger.info(
        userId,
        "userTableIds ::: tableIds ::>>",
        userProfile.tableIds
      );

      let nonProdMsg = "FAILED!";

      commonEventEmitter.emit(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.MAXIMUM_TABLE_ERROR_MSG,
          tableId: userProfile.tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
      return false;
    }

    // RECONNECTION CASE HANDLE
    let freshSignUp = true;
    let tableId = "";
    if (userProfile.tableId != "") {
      tableId = userProfile.tableId;
    }
    Logger.info(userId, "tableId :: ", tableId);
    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);

    Logger.info(userId, "tableGamePlay :: ==>>>", tableGamePlay);
    if (!tableGamePlay) {
      freshSignUp = true;
      tableId = EMPTY;
    }

    if (tableId && tableId !== "") {
      // (IMPLEMENT)
    } else {
      // Check User Balance
      let checkBalanceDetail: any = {};
      checkBalanceDetail = await checkBalance(
        { tournamentId: userProfile.lobbyId },
        userProfile.authToken,
        userProfile.socketId,
        userId
      );
      Logger.info(userId, "checkBalanceDetail  :: >> ", checkBalanceDetail);

      if (
        checkBalanceDetail &&
        checkBalanceDetail.userBalance.isInsufficiantBalance
      ) {
        console.log(
          userId,
          "isInsufficiantBalance :: >>",
          checkBalanceDetail.userBalance.isInsufficiantBalance
        );
        let nonProdMsg = "Insufficient Balance !";
        commonEventEmitter.emit(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
          socket,
          data: {
            isPopup: true,
            popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
            title: nonProdMsg,
            tableId: EMPTY,
            message: MESSAGES.ERROR.INSUFFICIENT_BALANCE,
            buttonCounts: NUMERICAL.ONE,
            button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
            button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
            button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
            isReset: true,
          },
        });
        return false;
      } else if (
        checkBalanceDetail &&
        !checkBalanceDetail.userBalance.isInsufficiantBalance
      ) {
        freshSignUp = true;
      } else {
        throw new Error("Unable to check Balance data");
      }
    }

    if (freshSignUp) {
      const findTableInput = {
        ...userSignUp.signUpData,
        ...{
          entryFee: Number(Number(signUpData.entryFee) / NUMERICAL.EIGHTY),
          noOfPlayer: signUpData.noOfPlayer,
          minPlayer: signUpData.minPlayer,
          moneyMode: signUpData.moneyMode,
          latitude: userProfile.latitude,
          longitude: userProfile.longitude,
          authToken: userProfile.authToken,
          isUseBot: signUpData.isUseBot,
        },
      };

      console.log("findTableInput >>", findTableInput);
      console.log("userProfile >>", userProfile);

      lock = await Lock.getLock().acquire([signUpData.lobbyId], 2000);
      const { tableConfig, tableGamePlay, playerGamePlay } =
        await findTableForUser(findTableInput, userProfile);

      userProfile.tableId = tableConfig._id;
      userProfile.tableIds.push(tableConfig._id);

      Logger.info(userId, "userProfile.tableIds ::>>", userProfile.tableIds);

      socket.tableId = userProfile.tableId;
      await userProfileCache.setUserProfile(userId, userProfile);

      const { currentGameTableInfoData, gameTableInfoData } =
        await formatingSignUpResData(userId);

      const formatedSignUpResponse = await formatSignUpData(userProfile);

      // fresh Signup acknowledged
      ackEvent(
        EVENT.SIGN_UP_SOCKET_EVENT,
        {
          signupResponse: formatedSignUpResponse,
          gameTableInfoData: gameTableInfoData,
          reconnect: false,
        },
        socket.userId,
        tableId,
        ack
      );
      return currentGameTableInfoData[NUMERICAL.ZERO];
    } else {
      throw new Errors.UnknownError("NOT_FRESH_SIGNUP");
    }
  } catch (error) {
    Logger.error("<<======= signUpHandler() Error ======>>", error);

    // (IMPLEMENT) ERROR Handling
  } finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(error, " signUpHandler ");
    }
  }
}

export default signUpHandler;
