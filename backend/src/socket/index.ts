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

const sendEventToRoom = async (
  roomId: string,
  responseData: IResponseData,
  socketId?: string
) => {
  const tableId = roomId;

  try {
    // let getRoom = global.IO.sockets.adapter.rooms.get(roomId);
    let getRoom = global.IO.sockets.adapter.rooms.get(roomId);
    if (getRoom) {
      // const roomSize = global.IO.sockets.sockets.get(socketId);
      const roomSize = global.IO.sockets.adapter.rooms.get(roomId).size;
      Logger.info(tableId, "roomeSize ::===>> ", roomSize);
    }

    if (typeof socketId == "string") {
      var socket = await global.IO.sockets.sockets.get(socketId);
      global.IO.to(socket.tableId).emit(
        responseData.eventName,
        JSON.stringify(responseData)
      );
    } else {
      global.IO.to(roomId).emit(
        responseData.eventName,
        JSON.stringify(responseData)
      );
    }
  } catch (error) {
    Logger.error(tableId, error, ` table ${roomId} function sendEventToRoom`);
  }
};

const addClientInRoom = async (
  socketId: any,
  roomId: string,
  userId: string
) => {
  try {
    let socket: any;

    if (typeof socketId == "string") {
      socket = await global.IO.sockets.sockets.get(socketId);
      socket.eventData = { tableId: roomId, userId };
      socket.tableId = roomId;
      socket.join(roomId);
    } else if (socket !== "string") {
      socketId.eventData = { tableId: roomId, userId };
      socket.tableId = roomId;
      socketId.join(roomId);
    }
    return true;
  } catch (error) {
    Logger.error(
      userId,
      error,
      ` table ${roomId} user ${userId} function addClientInRoom`
    );
  }
};

const leaveClientInRoom = async (socket: any, roomId: any) => {
  const tableId = roomId;
  try {
    Logger.info(tableId, "leaveClientInRoom :: >>>", roomId);
    if (socket !== "string" && socket.emit) {
      if (typeof socket != "undefined" && socket.emit) socket.leave(roomId);
    } else {
      socket = await global.IO.sockets.sockets.get(socket);
      if (typeof socket != "undefined" && socket.emit) socket.leave(roomId);
    }
  } catch (error) {
    Logger.error(tableId, "LEAVE CLIENT SOCKET ROOM :: ERROR ::", error);
  }
};

export {
  sendEventToClient,
  addClientInRoom,
  sendEventToRoom,
  leaveClientInRoom,
};
