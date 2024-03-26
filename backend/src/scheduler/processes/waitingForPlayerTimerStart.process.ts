import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";
import Logger from "../../logger";

const watingForPlayerTimerStartProcess = (job: any) => {
  try {
    Logger.info(
      "----->> Schuduler :: watingForPlayerTimerStartProcess :: Data ::",
      job.data
    );

    commonEventEmitter.emit(
      EVENT_EMITTER.WAITING_FOR_PLAYER_TIMER_EXPIRED,
      job.data
    );
    return job.data;
  } catch (e: any) {
    Logger.error(e);
    return undefined;
  }
};

export default watingForPlayerTimerStartProcess;
