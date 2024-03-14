import Logger from "../logger";

async function requestHandler(
  this: any,
  [reqEventName, payload, ask]: Array<any>,
  // @ts-ignore
  next
) {
  try {
    const socket: any = this;
    const body = typeof payload == "string" ? JSON.parse(payload) : payload;
    let response: any;
    console.log("Socket Event Handler called!!!");
  } catch (error) {
    Logger.error("requestHandler ERROR :: >> ", error);
  }
}

export default requestHandler;
