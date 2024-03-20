import { IDefaultTableConfig } from "./tableConfig";
import { IDefaultTableGamePlay } from "./tableGamePlay";

export interface IDefaultPlayerGamePlay {
  _id: string;
  userId: string;
  username: string;
  profilePic: string;
  seatIndex: number;
  userStatus: string;
  playingStatus: string;
  tCount: number;
  cardPoints: number;
  lastPickCard: string;
  pickFromDeck: string;
  currentCards: Array<any>;
  groupingCards: IPairData;
  turnTimeOut: number;
  seconderyTimerCounts: number;
  // useRejoin: boolean;
  winningCash: number;
  looseingCash: number;
  isDropAndMove: boolean;
  dropScore: number;
  ispickCard: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPairData {
  pure: Array<Array<string>>;
  impure: Array<Array<string>>;
  set: Array<Array<string>>;
  dwd: Array<Array<string>>;
}

export interface IInsertPlayerInTable {
  tableGamePlay: IDefaultTableGamePlay;
  playerGamePlay: IDefaultPlayerGamePlay;
  tableConfig: IDefaultTableConfig;
}
