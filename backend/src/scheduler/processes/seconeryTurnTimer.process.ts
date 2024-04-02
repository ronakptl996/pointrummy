import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const seconeryTurnTimerProcess = async (job: any) => {
  try {
    Logger.info(
      "----->> Schuduler :: seconeryTurnTimerProcess :: Data ::",
      job.data
    );

    commonEventEmitter.emit(EVENT_EMITTER.EXPIRE_SECONDERY_TIMER, job.data);

    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default seconeryTurnTimerProcess;
