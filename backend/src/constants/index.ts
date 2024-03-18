import SOCKET from "./socket";
import NUMERICAL from "./numerical";
import REDIS from "./redis";
import EVENT from "./event";

const exportObject = Object.freeze({
  SOCKET,
  NUMERICAL,
  REDIS,
  EVENT,
  GAME_TYPE: "PointRummy",
  EMPTY: "",
});

export = exportObject;
