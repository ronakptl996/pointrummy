import { EVENT } from "../constants";
import Logger from "../logger";
import joinTable from "../services/playTable/joinTable";
import pickCardFromCloseDackHandler from "./pickCardFromCloseDack";
import pickCardFromOpenDeckHandler from "./pickCardFromOpenDeck";
import signUpHandler from "./signUpHandler";

async function requestHandler(
  this: any,
  [reqEventName, payload, ack]: Array<any>,
  // @ts-ignore
  next
) {
  try {
    const socket: any = this;
    const body = typeof payload == "string" ? JSON.parse(payload) : payload;
    let response: any;
    console.log("Socket Event Handler called!!!");

    switch (reqEventName) {
      // Signup
      case EVENT.SIGN_UP_SOCKET_EVENT:
        let isRejoinOrNewGame = true;
        response = await signUpHandler(
          socket,
          body.data,
          isRejoinOrNewGame,
          ack
        );

        Logger.info("Before Join Table : response :: ===>>", response);

        if (
          response &&
          response &&
          "tableId" in response &&
          !response["reconnect"]
        ) {
          await joinTable(response, socket, false);
        }
        if (response && response["reconnect"]) {
          await joinTable(response, socket, true);
        }
        break;

      case EVENT.PICK_FROM_CLOSE_DECK_SOCKET_EVENT:
        response = await pickCardFromCloseDackHandler(socket, body.data);
        break;

      case EVENT.PICK_FROM_OPEN_DECK_SOCKET_EVENT:
        response = await pickCardFromOpenDeckHandler(socket, body.data);
    }
  } catch (error) {
    Logger.error("requestHandler ERROR :: >> ", error);
  }
}

export default requestHandler;
