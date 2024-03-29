import { ICards } from "./inputOutputDataFormator";
import { IDefaultPlayerGamePlay } from "./playerGamePlay";
export interface ICountDown {
  time: number;
  tableId: string;
}

export interface ITosscard {
  userId: string;
  si: number;
  card: string;
  name: string;
}

export interface ITossWinnerData {
  userId: string;
  si: number;
  card: string;
  name: string;
  msg: string;
}

export interface ITossCards {
  tableId: string;
  tossCardArr: Array<ITosscard>;
  tossWinnerData: ITossWinnerData;
}

export interface ISetDealer {
  DLR: number;
  round: number;
  tableId: string;
}

export interface IManageAndUpdateData {
  cards: Array<ICards>;
  totalScorePoint: number;
  playerGamePlayUpdated: IDefaultPlayerGamePlay;
}

export interface IFormateProvidedCards {
  cards: Array<ICards>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  trumpCard: Array<string>;
  cardCount: number;
  tableId: string;
}

export interface IStartUserTurnResponse {
  currentTurnUserId: string;
  currentTurnSI: number;
  turnTimer: number;
  // totalUserTurnTimer:number;
  isSeconderyTimer: boolean;
  isRemainSeconderyTurns: boolean;
  tableId: string;
}
