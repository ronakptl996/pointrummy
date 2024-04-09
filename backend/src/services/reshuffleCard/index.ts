import Logger from "../../logger";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import { NUMERICAL } from "../../constants";
import { shuffleCards } from "../../common";
import { IResuffalDataRes } from "../../interfaces/inputOutputDataFormator";
import { formatResuffalData } from "../../formatResponseData";
import { tableGamePlayCache } from "../../cache";

const reshuffleCard = async (
  tableGamePlay: IDefaultTableGamePlay,
  tableId: string
) => {
  try {
    let closedDeck: string[] = tableGamePlay.closedDeck;
    let openDeck: string[] = tableGamePlay.opendDeck;

    Logger.info(
      tableId,
      "for reshuffleCard use : closedDeck Cards",
      closedDeck.length
    );
    Logger.info(
      tableId,
      "for reshuffleCard use : opendDeck Cards",
      openDeck.length
    );

    if (closedDeck.length === NUMERICAL.ZERO) {
      closedDeck = openDeck;
      closedDeck = await shuffleCards(closedDeck);
      openDeck = closedDeck.splice(NUMERICAL.ZERO, NUMERICAL.ONE);

      tableGamePlay.closedDeck = closedDeck;
      tableGamePlay.opendDeck = openDeck;

      const formatedReshuffleData: IResuffalDataRes = await formatResuffalData(
        closedDeck,
        openDeck,
        tableId
      );

      Logger.info(tableId, "formatedResuffalData :: ", formatedReshuffleData);
    }

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    return true;
  } catch (error) {
    Logger.error(tableId, "reshuffleCard :: ERROR : ", error);
  }
};

export default reshuffleCard;
