import Logger from "../logger";
import config from "../config";
import manageAndUpdateData from "../utils/manageCardData";
import { userProfileCache, playerGamePlayCache } from "../cache";
import { diffSeconds } from "../common";
import { NUMERICAL, TABLE_STATE } from "../constants";
import {
  cardSortsResponseFormator,
  discardCardResponseFormator,
  endDragCardDataResponseFormator,
  groupCardResponseFormator,
  gtiResponseFormator,
  joinTableResponseFormator,
  leaveTableFormator,
  pickCardResponseFormator,
  providedCardResponseFormator,
  reshuffaleResponseFormator,
  scoreBoardFormator,
  setDealerResponseFormator,
  tossCardResponseFormator,
  userTurnResponseFormator,
} from "../validateResponse";
import {
  IDefaultTableConfig,
  INewGTIResponse,
  IScoreBoardRes,
  IUserResData,
  JTResponse,
} from "../interfaces/tableConfig";
import { IDefaultTableGamePlay } from "../interfaces/tableGamePlay";
import { ISeats, ISignupResponse } from "../interfaces/signup";
import { IUserProfileOutput } from "../interfaces/userProfile";
import { IDefaultPlayerGamePlay } from "../interfaces/playerGamePlay";
import {
  IFormateProvidedCards,
  ISetDealer,
  IStartUserTurnResponse,
  ITossCards,
  ITossWinnerData,
  ITosscard,
} from "../interfaces/round";
import {
  ICardSortsRes,
  ICards,
  IDiscardCardRes,
  IEndDragCardResponse,
  IGroupCardRes,
  ILeaveTableRes,
  IPickCardFormOpenDackRes,
  IResuffalDataRes,
} from "../interfaces/inputOutputDataFormator";

const { GAME_START_TIMER, LOCK_IN_TIMER, MAXIMUM_TABLE_CREATE_LIMIT } =
  config.getConfig();

const formatSignUpData = async (
  userProfileData: IUserProfileOutput
): Promise<ISignupResponse> => {
  const tableId = userProfileData.tableId;
  try {
    const data = {
      _id: userProfileData.id,
      un: userProfileData.username,
      pp: userProfileData.profilePic,
      // isRejoin: userProfileData.isRejoin,
      socketid: userProfileData.socketId,
      tableId: userProfileData.tableId,
      gameId: userProfileData.gameId,
      lobbyId: userProfileData.lobbyId,
      chips: String(userProfileData.balance.toFixed(2)),
      isPlay: userProfileData?.isPlay,
      isRobot: userProfileData.isRobot,
      latitude: userProfileData.latitude,
      longitude: userProfileData.longitude,
      entryFee: String(userProfileData.entryFee),
      maximumSeat: userProfileData.noOfPlayer,
      maxTableCreateLimit: Number(MAXIMUM_TABLE_CREATE_LIMIT),
    };
    return data;
  } catch (error: any) {
    Logger.error(tableId, "formatSignUpData error", error);
    throw new Error(error);
  }
};

const formateRejoinTableData = async (
  tableConfig: IDefaultTableConfig,
  tableGamePlay: IDefaultTableGamePlay,
  playerData: IDefaultPlayerGamePlay
) => {
  try {
    const GAME_START: number = Number(GAME_START_TIMER);
    const LOCK_TIMER: number = Number(LOCK_IN_TIMER);

    const tablePlayers: Array<ISeats> = [];

    const availablePlayerIds: Array<string> = tableGamePlay.seats.map(
      (e: ISeats): string => e.userId
    );

    const availablePlayerSeats: Array<number> = tableGamePlay.seats.map(
      (e: ISeats): number => e.si
    );

    const availablePlayerLength: number = availablePlayerIds.length;

    const availablePGP: Array<IDefaultPlayerGamePlay | null> =
      await Promise.all(
        availablePlayerIds.map(async (id: string) => {
          return await playerGamePlayCache.getPlayerGamePlay(
            id.toString(),
            tableConfig._id
          );
        })
      );

    const availableUsers = await Promise.all(
      availablePlayerIds.map(
        async (id: string) => await userProfileCache.getUserProfile(id)
      )
    );

    for (let i = 0; i < availablePlayerLength; i++) {
      const playerGamePlay = availablePGP[i];
      const userProfileData = availableUsers[i];
      const userId: string = availablePlayerIds[i];
      const playerSeat: number = availablePlayerSeats[i];

      if (playerGamePlay && userProfileData) {
        const seatPlayer: ISeats = {
          userId,
          si: playerSeat,
          name: userProfileData.username,
          pp: userProfileData.profilePic,
          userState: playerGamePlay.userStatus,
        };

        tablePlayers.push(seatPlayer);
      }
    }

    let remainingTimer =
      diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) *
      NUMERICAL.THOUSAND;

    if (tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED) {
      remainingTimer = GAME_START - remainingTimer;
    }

    if (tableGamePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD) {
      remainingTimer = Math.ceil(LOCK_TIMER - remainingTimer);
    }

    if (tableGamePlay.tableState === TABLE_STATE.ROUND_STARTED) {
      remainingTimer = tableConfig.userTurnTimer - remainingTimer;
    }

    const { cards, totalScorePoint } = await manageAndUpdateData(
      playerData.currentCards,
      playerData
    );

    let cardCount: number = NUMERICAL.ZERO;
    playerData.currentCards.map((ele: Array<string>) => {
      cardCount = cardCount + ele.length;
    });

    const data = {
      tableId: tableConfig._id,
      seatIndex: playerData.seatIndex,
      gameType: tableConfig.gameType,
      maximumSeat: tableConfig.noOfPlayer,
      minimumSeat: tableConfig.minPlayer,
      entryFee: String(tableConfig.entryFee),
      activePlayers: tableGamePlay.currentPlayerInTable,
      gameStartTimer: tableConfig.gameStartTimer,
      turnTimer: tableConfig.userTurnTimer,
      tableState: tableGamePlay.tableState,
      closedDeck: tableGamePlay.closedDeck,
      opendDeck: tableGamePlay.opendDeck,
      turnCount: tableGamePlay.turnCount,
      dealerPlayer: tableGamePlay.dealerPlayer,
      declareingPlayer: tableGamePlay.declareingPlayer,
      validDeclaredPlayer: tableGamePlay.validDeclaredPlayer,
      validDeclaredPlayerSI: tableGamePlay.validDeclaredPlayerSI,
      playersDetail: tablePlayers,
      reconnect: true,
    };

    return data;
  } catch (error) {
    Logger.error(
      `formatRejoinTableData for table ${tableConfig._id} user ${
        playerData && playerData.userId ? playerData.userId : ""
      }  `,
      error
    );
    throw new Error(`INTERNAL_ERROR_formatRejoinTableData() ${error} `);
  }
};

const formateUpdatedGameTableData = async (
  tableConfig: IDefaultTableConfig,
  tableGamePlay: IDefaultTableGamePlay,
  playerData: IDefaultPlayerGamePlay
) => {
  const userId = playerData.userId;
  try {
    const tablePlayers: Array<ISeats> = [];

    const availablePlayerIds: Array<string> = tableGamePlay.seats.map(
      (e: ISeats): string => e.userId
    );

    const availablePlayerLength: number = availablePlayerIds.length;

    const availablePGP: Array<IDefaultPlayerGamePlay | null> =
      await Promise.all(
        availablePlayerIds.map(async (id: string) => {
          return await playerGamePlayCache.getPlayerGamePlay(
            id.toString(),
            tableConfig._id
          );
        })
      );

    const availableUsers: Array<IUserProfileOutput | null> = await Promise.all(
      availablePlayerIds.map(
        async (id: string) => await userProfileCache.getUserProfile(id)
      )
    );

    for (let i = 0; i < availablePlayerLength; i++) {
      const playerGamePlay = availablePGP[i];
      const userProfileData = availableUsers[i];

      if (playerGamePlay && userProfileData) {
        const seatPlayer: ISeats = {
          userId: playerGamePlay.userId,
          si: playerGamePlay.seatIndex,
          name: userProfileData.username,
          pp: userProfileData.profilePic,
          userState: playerGamePlay.userStatus,
        };
        tablePlayers.push(seatPlayer);
      }
    }

    const data: INewGTIResponse = {
      tableId: tableConfig._id,
      seatIndex: playerData.seatIndex,
      gameType: tableConfig.gameType,
      maximumSeat: Number(tableConfig.noOfPlayer),
      minimumSeat: Number(tableConfig.minPlayer),
      entryFee: String(tableConfig.entryFee),
      activePlayers: tableGamePlay.currentPlayerInTable,
      gameStartTimer: tableConfig.gameStartTimer,
      turnTimer: tableConfig.userTurnTimer,
      tableState: tableGamePlay.tableState,
      closedDeck: tableGamePlay.closedDeck,
      opendDeck: tableGamePlay.opendDeck,
      turnCount: tableGamePlay.turnCount,
      dealerPlayer: tableGamePlay.dealerPlayer,
      declareingPlayer: tableGamePlay.declareingPlayer,
      validDeclaredPlayer: tableGamePlay.validDeclaredPlayer,
      validDeclaredPlayerSI: tableGamePlay.validDeclaredPlayerSI,
      playersDetail: tablePlayers,
    };

    const validateGTIResponse = await gtiResponseFormator(data);
    return validateGTIResponse;
  } catch (error: any) {
    Logger.error(
      userId,
      `formateUpdatedGameTableData for table ${tableConfig._id}  user ${
        playerData && playerData.userId ? playerData.userId : ""
      }`,
      error
    );
    throw new Error(error);
  }
};

const formatJoinTableData = async (
  seats: ISeats,
  rejoin: boolean,
  userState: string
) => {
  try {
    const data: JTResponse = {
      si: seats.si,
      userId: seats.userId,
      name: seats.name,
      pp: seats.pp,
      userState,
    };

    if (rejoin) data.rejoin = rejoin;
    const validatedJoinTableResponse = await joinTableResponseFormator(data);

    return validatedJoinTableResponse;
  } catch (error) {
    Logger.error(`formatJoinTableData for table user ${error}`);
    throw new Error(
      `INTERNAL_ERROR_formatJoinTableData() ===>> Error::${error}`
    );
  }
};

const formatDiscardCardData = async (
  userId: string,
  seatIndex: number,
  tableId: string,
  cards: Array<ICards>,
  totalScorePoint: number,
  opencards: Array<string>
) => {
  try {
    const data: IDiscardCardRes = {
      userId,
      si: seatIndex,
      tableId,
      cards,
      totalScorePoint,
      opendDeck: opencards,
    };

    const validatedDiscardCardResponse: IDiscardCardRes =
      await discardCardResponseFormator(data);

    return validatedDiscardCardResponse;
  } catch (error) {
    Logger.error(
      tableId,
      `formatDiscardCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatDiscardCardData() ERROR :::", error);
    throw new Error(`formatDiscardCardData() ERROR ::: ${error}`);
  }
};

const formatTossCardData = async (
  tableId: string,
  tossCardArr: Array<ITosscard>,
  tossWinnerData: ITossWinnerData
) => {
  try {
    const data: ITossCards = {
      tableId,
      tossCardArr,
      tossWinnerData,
    };

    const validatedTossCardResponse: ITossCards =
      await tossCardResponseFormator(data);

    return validatedTossCardResponse;
  } catch (error) {
    Logger.error(tableId, `formatTossCardData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatTossCardData() ==>> ${error} `);
  }
};

const formatSetDealerData = async (
  tableId: string,
  dealerSeatIndex: number,
  currentRound: number
) => {
  try {
    const data: ISetDealer = {
      DLR: dealerSeatIndex,
      round: currentRound,
      tableId,
    };

    const validatedSetDealerResponse: ISetDealer =
      await setDealerResponseFormator(data);

    return validatedSetDealerResponse;
  } catch (error) {
    Logger.error(tableId, `formatSetDearData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatSetDearData() ==>> ${error} `);
  }
};

const formatProvidedCards = async (
  tableId: string,
  userId: string,
  closedDeck: Array<string>,
  opendDeck: Array<string>,
  trumpCard: Array<string>,
  cards: Array<ICards>
) => {
  try {
    const providedCardData: IFormateProvidedCards = {
      cards,
      opendDeck,
      trumpCard,
      closedDeck,
      cardCount: cards[0].group.length,
      tableId,
    };

    const validatedCardResponse: IFormateProvidedCards =
      await providedCardResponseFormator(providedCardData);

    return validatedCardResponse;
  } catch (error) {
    Logger.error(
      tableId,
      `formateProvidedCards for table ${tableId} for user ${
        userId ? userId : ""
      }`,
      error
    );
    throw new Error(
      `INTERNAL_ERROR_formateProvidedCards()    Error ==>>> : ${error} `
    );
  }
};

const formatStartUserTurn = async (
  tableConfig: IDefaultTableConfig,
  currentTurnUserId: string,
  currentTurnSI: number,
  isSeconderyTimer: boolean,
  isRemainSeconderyTurns: boolean,
  tableId: string
): Promise<IStartUserTurnResponse> => {
  try {
    let data: IStartUserTurnResponse = {} as IStartUserTurnResponse;
    if (!isSeconderyTimer) {
      data = {
        isSeconderyTimer: isSeconderyTimer,
        currentTurnUserId,
        currentTurnSI,
        isRemainSeconderyTurns,
        turnTimer: Number(tableConfig.userTurnTimer / NUMERICAL.THOUSAND),
        tableId,
      };
    } else if (isSeconderyTimer) {
      data = {
        isSeconderyTimer: isSeconderyTimer,
        currentTurnUserId,
        currentTurnSI,
        isRemainSeconderyTurns,
        // totalUserTurnTimer: timer,
        turnTimer: Number(tableConfig.secondaryTimer / NUMERICAL.THOUSAND),
        tableId,
      };
    }

    const validatedUserTurnResponse: IStartUserTurnResponse =
      await userTurnResponseFormator(data);

    return validatedUserTurnResponse;
  } catch (error) {
    Logger.error(
      tableId,
      `formatStartUserTurn for table ${tableConfig._id} for user ${
        currentTurnUserId ? currentTurnUserId : ""
      }`,
      error
    );
    Logger.info(tableId, "formatStartUserTurn() ERROR :::", error);
    throw new Error(`formatStartUserTurn() ERROR ::: ${error}`);
  }
};

const formatLeaveTableData = async (
  tableId: string,
  playerGamePlay: IDefaultPlayerGamePlay,
  message: string,
  updatedUserCount: number,
  tableState: string
) => {
  try {
    const data = {
      userId: playerGamePlay.userId,
      tableId,
      currentRound: NUMERICAL.ONE,
      name: playerGamePlay.username,
      si: playerGamePlay.seatIndex,
      pp: playerGamePlay.profilePic,
      message,
      updatedUserCount,
      tableState,
    };

    const validatedLeaveTableResponse: ILeaveTableRes =
      await leaveTableFormator(data);
    return validatedLeaveTableResponse;
  } catch (error) {
    Logger.error(tableId, `formatLeaveTableData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatLeaveTableData() ${error}`);
  }
};

const formatScoreBoardData = async (
  tableId: string,
  allUserPGP: Array<IUserResData>,
  trumpCard: string[],
  timer: number,
  isScoreBoardShow: boolean,
  isNewGameStart: boolean = true
) => {
  try {
    const data = {
      tableId,
      scoreBoardTable: allUserPGP,
      trumpCard,
      timer,
      isScoreBoardShow,
      isNewGameStart,
    };

    const validatedScoreBoardRes: IScoreBoardRes = await scoreBoardFormator(
      data
    );
    return validatedScoreBoardRes;
  } catch (error) {
    Logger.error(tableId, `formatScoreBoardData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatScoreBoardData() ${error}`);
  }
};

const formatNewScoreBoardData = async (
  tableId: string,
  allUserPGP: Array<IUserResData>,
  trumpCard: string[],
  timer: number,
  isScoreBoardShow: boolean,
  isNewGameStart: boolean = false
) => {
  try {
    const data = {
      tableId,
      scoreBoardTable: allUserPGP,
      trumpCard,
      timer,
      isScoreBoardShow,
      isNewGameStart,
    };

    const validatedScoreBoardRes: IScoreBoardRes = await scoreBoardFormator(
      data
    );
    return validatedScoreBoardRes;
  } catch (error) {
    Logger.error(tableId, `formatScoreBoardData for table ${tableId} `, error);
    throw new Error(`INTERNAL_ERROR_formatScoreBoardData() ${error}`);
  }
};

const formatPickCardFormCloseDeckData = async (
  userId: string,
  seatIndex: number,
  tableId: string,
  cards: Array<ICards>,
  totalScorePoint: number,
  msg: string,
  pickUpCard: string
) => {
  try {
    const data = {
      userId,
      si: seatIndex,
      tableId,
      cards,
      totalScorePoint,
      msg,
      pickUpCard: pickUpCard,
    };

    const validatedPickCardResponse = await pickCardResponseFormator(data);

    return validatedPickCardResponse;
  } catch (error) {
    Logger.error(
      tableId,
      `formatPickCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatPickCardData() ERROR :::", error);
    throw new Error(`formatPickCardData() ERROR ::: ${error}`);
  }
};

const formatResuffalData = async (
  closedDeck: Array<string>,
  openDeck: Array<string>,
  tableId: string
) => {
  try {
    const data: IResuffalDataRes = {
      closedDeck,
      openDeck,
      tableId,
    };

    const validatedReshuffalDataResponse: IResuffalDataRes =
      await reshuffaleResponseFormator(data);
    return validatedReshuffalDataResponse;
  } catch (error) {
    Logger.error(tableId, `formatResuffalData ERROR`, error);
    Logger.info(tableId, "formatResuffalData() ERROR :::", error);
    throw new Error(`formatResuffalData() ERROR ::: ${error}`);
  }
};

const formatPickCardFromOpenDeckData = async (
  userId: string,
  seatIndex: number,
  tableId: string,
  cards: Array<ICards>,
  totalScorePoint: number,
  msg: string,
  pickUpCard: string
): Promise<IPickCardFormOpenDackRes> => {
  try {
    const data: IPickCardFormOpenDackRes = {
      userId,
      si: seatIndex,
      tableId,
      cards,
      totalScorePoint,
      msg,
      pickUpCard,
    };

    const validatedPickCardResponse: IPickCardFormOpenDackRes =
      await pickCardResponseFormator(data);

    return validatedPickCardResponse;
  } catch (error: any) {
    Logger.error(
      tableId,
      `formatPickCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatPickCardData() ERROR :::", error);
    throw new Error(`formatPickCardData() ERROR ::: ${error}`);
  }
};

const formatGroupCardData = async (
  userId: string,
  tableId: string,
  cards: Array<ICards>,
  totalScorePoint: number,
  msg: string
) => {
  try {
    const data: IGroupCardRes = {
      userId,
      tableId,
      cards,
      totalScorePoint,
      msg,
    };

    const validatedGroupCardResponse: IGroupCardRes =
      await groupCardResponseFormator(data);

    return validatedGroupCardResponse;
  } catch (error) {
    Logger.error(
      tableId,
      `formatGroupCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatGroupCardData() ERROR :::", error);
    throw new Error(`formatGroupCardData() ERROR ::: ${error}`);
  }
};

const formatCardsSortsData = async (
  userId: string,
  tableId: string,
  cards: Array<ICards>,
  totalScorePoint: number
) => {
  try {
    const data: ICardSortsRes = {
      userId,
      tableId,
      cards,
      totalScorePoint,
    };

    const validatedCardSortsResponse: ICardSortsRes =
      await cardSortsResponseFormator(data);
    return validatedCardSortsResponse;
  } catch (error) {
    Logger.error(
      tableId,
      `formatedCardGroupsData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatedCardGroupsData() ERROR :::", error);
    throw new Error(`formatedCardGroupsData() ERROR ::: ${error}`);
  }
};

const formatEndDragCardData = async (
  userId: string,
  tableId: string,
  cards: Array<ICards>,
  totalScorePoint: number
) => {
  try {
    const data: IEndDragCardResponse = {
      userId,
      tableId,
      cards,
      totalScorePoint,
    };

    const validatedEndDragCardResponse = await endDragCardDataResponseFormator(
      data
    );

    return validatedEndDragCardResponse;
  } catch (error) {
    Logger.error(
      tableId,
      `formatedEndDragCardData for table ${tableId} for user ${userId}`,
      error
    );
    Logger.info(tableId, "formatedEndDragCardData() ERROR :::", error);
    throw new Error(`formatedEndDragCardData() ERROR ::: ${error}`);
  }
};

export {
  formateRejoinTableData,
  formateUpdatedGameTableData,
  formatSignUpData,
  formatJoinTableData,
  formatTossCardData,
  formatSetDealerData,
  formatProvidedCards,
  formatStartUserTurn,
  formatDiscardCardData,
  formatLeaveTableData,
  formatScoreBoardData,
  formatNewScoreBoardData,
  formatPickCardFormCloseDeckData,
  formatPickCardFromOpenDeckData,
  formatResuffalData,
  formatGroupCardData,
  formatCardsSortsData,
  formatEndDragCardData,
};
