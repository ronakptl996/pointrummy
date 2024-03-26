import Logger from "../logger";
import global from "../global";

interface IResponseData {
  eventName: string;
  data: any;
}

const sendEventToClient = async (
  socket: any,
  responseData: IResponseData,
  tableId: string
) => {
  try {
    let socketObj = socket;

    if (typeof socketObj === "string") {
      socketObj = await global.IO.sockets.sockets.get(socket);
      global.IO.to(socket).emit(
        responseData.eventName,
        JSON.stringify(responseData)
      );
    } else {
      socketObj.emit(responseData.eventName, JSON.stringify(responseData));
      return;
    }
  } catch (error) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} function sendEventToClient`
    );
  }
};

export { sendEventToClient };
