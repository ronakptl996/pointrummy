import SOCKET from "./socket";
import NUMERICAL from "./numerical";
import TABLE_STATE from "./tableState";
import REDIS from "./redis";
import EVENT from "./event";
import MESSAGES from "./messsages";
import PLAYER_STATE from "./playerState";
import CARDS_STATUS from "./cardsStatus";

const exportObject = Object.freeze({
  SOCKET,
  NUMERICAL,
  REDIS,
  EVENT,
  GAME_TYPE: "PointRummy",
  EMPTY: "",
  MESSAGES,
  TABLE_STATE,
  PLAYER_STATE,
  CARDS_STATUS,
});

export = exportObject;
