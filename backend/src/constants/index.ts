import SOCKET from "./socket";
import NUMERICAL from "./numerical";
import TABLE_STATE from "./tableState";
import REDIS from "./redis";
import EVENT from "./event";
import MESSAGES from "./messsages";

const exportObject = Object.freeze({
  SOCKET,
  NUMERICAL,
  REDIS,
  EVENT,
  GAME_TYPE: "PointRummy",
  EMPTY: "",
  MESSAGES,
  TABLE_STATE,
});

export = exportObject;
