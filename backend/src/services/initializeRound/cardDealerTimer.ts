import Logger from "../../logger";
import Errors from "../../errors";
import { EVENT, PLAYER_STATE, TABLE_STATE } from "../../constants";
import { IRoundStart } from "../../interfaces/common";
import { tableConfigCache, tableGamePlayCache } from "../../cache";
import getAllPlayingUser from "../common/getAllPlayingUser";

const cardDealingTimer = async (cardDealData: IRoundStart) => {
  let { tableId } = cardDealData;
  try {
    Logger.info(tableId, `Starting user Turn start for tableId : ${tableId}`);

    const [tableGamePlay, tableConfig] = await Promise.all([
      tableGamePlayCache.getTableGamePlay(tableId),
      tableConfigCache.getTableConfig(tableId),
    ]);
    if (!tableGamePlay || !tableConfig) {
      throw Error("Unable to get data at tableGamePlay or tableConfig");
    }

    Logger.info(
      tableId,
      " cardDealingTimer :: tableGamePlay ::: >>",
      tableGamePlay
    );
    Logger.info(
      tableId,
      " cardDealingTimer :: tableGamePlay.dealerPlayer ::: ",
      tableGamePlay.dealerPlayer
    );
    Logger.info(
      tableId,
      " cardDealingTimer :: tableGamePlay.tossWinPlayer ::: ",
      tableGamePlay.tossWinPlayer
    );

    const getAllPlayingPlayer = await getAllPlayingUser(tableGamePlay.seats);
    Logger.info(
      tableId,
      `roundDealerSetTimer getAllPlayingPlayer  :: `,
      getAllPlayingPlayer
    );

    if (
      tableGamePlay.currentPlayerInTable < tableConfig.minPlayer ||
      getAllPlayingPlayer.length < tableConfig.minPlayer
    ) {
      throw new Errors.InvalidInput(
        "currentPlayerInTable is not more than two players"
      );
    }

    if (tableGamePlay.tableState === TABLE_STATE.START_DEALING_CARD) {
      let turnSeat = 0;
      for (let i = 0; i < tableGamePlay.seats.length; i++) {
        const element = tableGamePlay.seats[i];
        if (
          tableGamePlay.tossWinPlayer == element.si &&
          element.userState == PLAYER_STATE.PLAYING
        ) {
          turnSeat = i;
          break;
        } else {
          for (let j = i + 1; j <= tableGamePlay.seats.length; j++) {
            Logger.info(tableId, "IN===> :>> ");
            const ele = tableGamePlay.seats[j];
            if (ele.userState == PLAYER_STATE.PLAYING) {
              turnSeat = j;
              break;
            }

            if (j === tableGamePlay.seats.length) {
              for (let j = 0; j < tableGamePlay.seats.length; j++) {
                Logger.info(tableId, "IN==12====> :>> ");
                const ele = tableGamePlay.seats[j];
                if (ele.userState == PLAYER_STATE.PLAYING) {
                  turnSeat = j;
                  break;
                }
              }
            }
          }
        }
      }

      Logger.info(tableId, "turnSeat :>> ", turnSeat);

      const userData = tableGamePlay.seats[turnSeat];

      tableGamePlay.tableState = TABLE_STATE.ROUND_STARTED;
      tableGamePlay.currentTurnSeatIndex = turnSeat;
      tableGamePlay.updatedAt = new Date().toString();
      tableGamePlay.isSeconderyTimer = false;

      Logger.info(tableId, " userData ::: ", userData);
      if (!userData) {
        throw Error("Unable to get data at userData");
      }
    }
  } catch (error) {}
};
