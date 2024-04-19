export interface ICards {
  group: Array<string>;
  groupType: string;
  cardPoints: number;
}

// Leave table Data in Request and Response
export interface ILeaveTableInput {
  userId: string;
  tableId: string;
  currentRound: number;
  isLeaveFromScoreBoard: boolean;
}

export interface IPickCardFromCloseDackInput {
  userId: string;
  tableId: string;
  currentRound: number;
}

export interface IPickCardFormCloseDackResponse {
  userId: string;
  si: number;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
  msg: string;
  pickUpCard: string;
}

export interface IPickCardFormOpenDackInput {
  userId: string;
  tableId: string;
  currentRound: number;
}

export interface IPickCardFormOpenDackRes {
  userId: string;
  si: number;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
  msg: string;
  pickUpCard: string;
}

export interface ILeaveTableRes {
  userId: string;
  tableId: string;
  currentRound: number;
  name: string;
  si: number;
  pp: string;
  message: string;
  updatedUserCount: number;
  tableState: string;
}

// Discardcard Request & Response
export interface IDiscardCardRes {
  userId: string;
  si: number;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
  opendDeck: Array<string>;
}

// Resuffal Data
export interface IResuffalDataRes {
  closedDeck: Array<string>;
  openDeck: Array<string>;
  tableId: string;
}

export interface IGroupCards {
  card: string;
  groupIndex: number;
}

/* discardCard Request & Response: start */
export interface IDiscardCardInput {
  userId: string;
  tableId: string;
  currentRound: number;
  cards: Array<IGroupCards>;
}

// groupCard in Request & Response
export interface IGroupCardInput {
  userId: string;
  tableId: string;
  currentRound: number;
  cards: Array<IGroupCards>;
}

export interface IGroupCardRes {
  userId: string;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
  msg: string;
}

// save card in group Request & Response
export interface ISaveCardsInSortsInput {
  userId: string;
  tableId: string;
  currentRound: number;
}
export interface ICardSortsRes {
  userId: string;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
}

// endDragCard in Request & Response
export interface IEndDragCardInput {
  userId: string;
  tableId: string;
  currentRound: number;
  cards: Array<IGroupCards>;
  destinationGroupIndex: number;
  cardIndexInGroup: number;
}

export interface IEndDragCardResponse {
  userId: string;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
}
