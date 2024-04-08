import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const scoreBoardProcess = (job: any) => {
  try {
    Logger.info("----->> Schuduler :: scoreBoardProcess :: Data ::", job.data);
    commonEventEmitter.emit(EVENT_EMITTER.EXPIRE_SCORE_BOARD_TIMER, job.data);
    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default scoreBoardProcess;
