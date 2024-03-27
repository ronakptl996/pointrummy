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
