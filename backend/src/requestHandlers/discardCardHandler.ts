import Logger from "../logger";
import { IDiscardCardInput } from "../interfaces/inputOutputDataFormator";
import { discardCardDataFormator } from "../InputDataFormator";

const discardCardHandler = async (
  socket: any,
  discardCardData: IDiscardCardInput
) => {
  Logger.info("=========discardCardData >>", discardCardData);
  const userId = String(discardCardData.userId) || socket.userId;
  const tableId = String(discardCardData.tableId) || socket.tableId;
  const socketId = socket.id;

  let lock: any = null;

  try {
    let userDiscardCard: string;
    let userDiscardCardGroupIndex: number;

    discardCardData.cards.map((ele) => {
      userDiscardCard = ele.card;
      userDiscardCardGroupIndex = ele.groupIndex;
    });

    const formatedDiscardCardData = await discardCardDataFormator(
      discardCardData
    );

    Logger.info(
      tableId,
      " reqData : formatedDiscardCardHandlerData ===>> ",
      formatedDiscardCardData
    );
  } catch (error) {}
};

export default discardCardHandler;
