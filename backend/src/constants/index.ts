import SOCKET from "./socket";
import NUMERICAL from "./numerical";
import TABLE_STATE from "./tableState";
import REDIS from "./redis";
import EVENT from "./event";
import MESSAGES from "./messsages";
import PLAYER_STATE from "./playerState";
import CARDS_STATUS from "./cardsStatus";
import EVENT_EMITTER from "./eventEmitter";
import SHUFFLE_CARDS from "./shuffleCards";

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
  EVENT_EMITTER,
  CARDS_STATUS,
  SHUFFLE_CARDS,
});

export = exportObject;
