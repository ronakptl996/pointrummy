import { EVENT } from "../constants";
import Logger from "../logger";
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
    }
  } catch (error) {
    Logger.error("requestHandler ERROR :: >> ", error);
  }
}

export default requestHandler;
