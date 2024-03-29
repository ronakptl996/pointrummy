import Logger from "../logger";
import config from "../config";
import manageAndUpdateData from "../utils/manageCardData";
import { userProfileCache, playerGamePlayCache } from "../cache";
import { diffSeconds } from "../common";
import { NUMERICAL, TABLE_STATE } from "../constants";
import {
  gtiResponseFormator,
  joinTableResponseFormator,
  providedCardResponseFormator,
  setDealerResponseFormator,
  tossCardResponseFormator,
  userTurnResponseFormator,
} from "../validateResponse";
import {
  IDefaultTableConfig,
  INewGTIResponse,
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
import { ICards } from "../interfaces/inputOutputDataFormator";

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

export {
  formateRejoinTableData,
  formateUpdatedGameTableData,
  formatSignUpData,
  formatJoinTableData,
  formatTossCardData,
  formatSetDealerData,
  formatProvidedCards,
  formatStartUserTurn,
};
