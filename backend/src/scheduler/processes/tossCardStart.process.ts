import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const tossCardStartTimerProcess = (job: any) => {
  try {
    Logger.info(
      "----->> Schuduler :: tossCardStartProcess :: Data ::",
      job.data
    );

    commonEventEmitter.emit(EVENT_EMITTER.TOSS_CARD_EXPIRED, job.data);

    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default tossCardStartTimerProcess;
