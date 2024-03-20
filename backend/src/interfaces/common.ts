export interface ICheckBalance {
  tournamentId: string;
}

export interface IBlockUserCheck {
  tableId: string;
  isNewTableCreated: boolean;
}

export interface IRediusCheckData {
  _id: string;
  gameId: string;
  isGameRadiusLocationOn: boolean;
  LocationRange: string;
  numericId: number;
  createdAt: string;
  updatedAt: string;
}
