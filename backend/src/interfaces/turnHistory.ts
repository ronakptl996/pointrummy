import { IPairData } from "./playerGamePlay";

export interface ITurnDetails {
  turnNo: number;
  userId: string;
  turnStatus: string;
  cardState: IPairData;
  cardPoints: number;
  cardPicked: string;
  cardPickSource: string;
  cardDiscarded: string;
  createdOn: string;
}

export interface IUserDetail {
  name: string;
  userId: string;
  seatIndex: number;
  pp: string;
}

export interface IGameDetails {
  roundNo: number;
  winnerId: number[];
  createdOn: string;
  modifiedOn: string;
  extra_info: string;
  userDetails: Array<IUserDetail>;
  turnsDetails: Array<ITurnDetails>;
}
