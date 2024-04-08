import Logger from "../../logger";
import Errors from "../../errors";
import { IUserResData } from "../../interfaces/tableConfig";
import { EMPTY, NUMERICAL, PLAYER_STATE } from "../../constants";
import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { IFormatedwinnerScoreData } from "../../interfaces/winner";

const formatMultiPlayerScore = async (
  tableId: string,
  winnerUserId: string,
  winnerSI: number,
  allUserPGP: Array<IUserResData>
) => {
  console.log(
    "TBALE>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
    tableId
  );

  try {
    if (winnerUserId && winnerUserId != EMPTY) {
      Logger.info(
        tableId,
        "allUserPGP :>> ",
        allUserPGP,
        "winnerUserId :: ",
        winnerUserId,
        "winnerSI ::",
        winnerSI
      );

      const [tableConfig, tableGamePlay] = await Promise.all([
        tableConfigCache.getTableConfig(tableId),
        tableGamePlayCache.getTableGamePlay(tableId),
      ]);

      if (!tableConfig)
        throw new Errors.UnknownError("Unable to get table data");
      if (!tableGamePlay)
        throw new Errors.UnknownError("Unable to get table data");

      const tournamentId = tableConfig.lobbyId;
      let playersScore = <Array<IFormatedwinnerScoreData>>[];
      for (let i = 0; i < allUserPGP.length; i++) {
        const player = allUserPGP[i];
        const tempObj = <IFormatedwinnerScoreData>{};

        if (
          winnerUserId == player.userId &&
          player.result == PLAYER_STATE.WON
        ) {
          tempObj.userId = player.userId;
          tempObj.score = `${player.score}`;
          tempObj.winLossStatus = "Win";
          const amountUpdate =
            Math.abs(Number(player.amount)) +
            NUMERICAL.EIGHTY * tableConfig.entryFee;
          Logger.info(tableId, "WON user: amountUpdate :>> ", amountUpdate);
          tempObj.winningAmount = `${amountUpdate}`;
          playersScore.push(tempObj);
        }
      }

      let otherPlayersScore = <Array<IFormatedwinnerScoreData>>[];
      let otherUserRank = NUMERICAL.TWO;
      for (let i = 0; i < allUserPGP.length; i++) {
        const player = allUserPGP[i];
        const tempObj = <IFormatedwinnerScoreData>{};
        if (playersScore[0].userId !== player.userId) {
          tempObj.userId = player.userId;
          tempObj.score = `${player.score}`;
          tempObj.winLossStatus = "Loss";
          const amountUpdate =
            NUMERICAL.EIGHTY * tableConfig.entryFee -
            Math.abs(Number(player.amount));

          tempObj.winningAmount = `${amountUpdate}`;
          otherPlayersScore.push(tempObj);
          otherUserRank++;
        }
      }

      otherPlayersScore.sort(
        (a: IFormatedwinnerScoreData, b: IFormatedwinnerScoreData) => {
          return Number(a.score) - Number(b.score);
        }
      );

      Logger.info("SORTED :: otherPlayersScore  ::==>>", otherPlayersScore);

      playersScore = playersScore.concat(otherPlayersScore);

      for (let i = 0; i < playersScore.length; i++) {
        playersScore[i].rank = `${i + 1}`;
      }

      Logger.info(
        "formatMultiPlayerScore :: playersScore :==>> ",
        playersScore
      );

      const resObj = {
        tableId,
        tournamentId,
        playersScore,
      };

      Logger.info(tableId, "formatMultiPlayerScore :: resObj :>> ", resObj);

      return resObj;
    } else {
      throw new Errors.InvalidInput("Unable to get format Mult iPlayer Score");
    }
  } catch (error) {
    Logger.error(tableId, `formatMultiPlayerScore Error :: ${error}`);
    return error;
  }
};

export default formatMultiPlayerScore;
