import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const playerTurnTimerProcess = (job: any) => {
  try {
    Logger.info(
      "----->> Schuduler :: playerTurnTimerProcess :: Data ::",
      job.data
    );
    commonEventEmitter.emit(EVENT_EMITTER.PLAYER_TURN_TIMER_EXPIRED, job.data);

    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default playerTurnTimerProcess;
