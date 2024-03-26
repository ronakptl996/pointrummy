import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import roundTimerStartProcess from "../processes/roundTimerStart.process";

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  REDIS_DB,
  NODE_ENV,
  REDIS_CONNECTION_URL,
} = config.getConfig();

const SchedulerRedisConfig = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password: String(REDIS_AUTH),
};

let roundTimerStartQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for Production
} else {
  roundTimerStartQueue = new Bull(`roundTimerStart_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const roundTimerStart = async (data: any) => {
  const tableId = data.tableId;
  try {
    Logger.info(tableId, `---- roundTimerStart ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    await roundTimerStartQueue.add(data, options);
    return roundTimerStartQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

roundTimerStartQueue.process(roundTimerStartProcess);

export default roundTimerStart;
