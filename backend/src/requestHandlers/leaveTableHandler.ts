import { leaveTableFormator } from "../InputDataFormator";
import { ILeaveTableInput } from "../interfaces/inputOutputDataFormator";
import Logger from "../logger";

const leaveTableHandler = async (
  socket: any,
  leaveTableData: ILeaveTableInput,
  isLeaveEventSend: boolean = true
) => {
  const socketId = socket.id;
  const userId = String(leaveTableData.userId) || socket.userId;
  const tableId: string = String(leaveTableData.tableId) || socket.tableId;

  let lock: any = null;
  try {
    Logger.info(tableId, "leaveTableHandler : starting ...");
    const formatedLeaveTableHandlerData = await leaveTableFormator(
      leaveTableData
    );
    Logger.info(
      tableId,
      " reqData :: formatedLeaveTableHandlerData ==>>",
      formatedLeaveTableHandlerData
    );
  } catch (error) {}
};
