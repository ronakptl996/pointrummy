import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const cardDealingProcess = (job: any) => {
  try {
    Logger.info(" cardDealingProcess :: job is ::", job.data);

    commonEventEmitter.emit(EVENT_EMITTER.CARD_DEALING_TIMER_EXPIRED, job.data);

    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default cardDealingProcess;
