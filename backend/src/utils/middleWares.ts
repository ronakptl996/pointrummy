import { EVENT } from "../constants";

// @ts-ignore
const ackMid = (eventName, response, userId, tableId, ack) => {
  try {
    if (response && "tableId" in response && response.success)
      delete response.tableId;

    if (eventName != EVENT.HEART_BEAT_SOCKET_EVENT) {
    }

    ack(
      JSON.stringify({
        eventName,
        success: true,
        data: response,
        userId,
        tableId,
      })
    );
  } catch (error) {
    console.log("CATCH_ERROR in ackMid: ", error);
    // @ts-ignore
    throw new Error("ackMid error catch  : ", error);
  }
};

export default ackMid;
