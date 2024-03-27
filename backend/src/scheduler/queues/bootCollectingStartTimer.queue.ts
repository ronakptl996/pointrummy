import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import bootCollectingStartTimerProcess from "../processes/bootCollectingStartTimer.process";

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  REDIS_DB,
  REDIS_CONNECTION_URL,
  NODE_ENV,
} = config.getConfig();

const SchedulerRedisConfig = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password: String(REDIS_AUTH),
};

let bootCollectingStartQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) Production
} else {
  bootCollectingStartQueue = new Bull(`bootCollectingStart_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const bootCollectingStartTimer = async (data: any) => {
  const tableId = data.tableId;
  try {
    Logger.info(
      tableId,
      `---- bootCollectingStartTimer ::=>> ${JSON.stringify(data)}`
    );
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    await bootCollectingStartQueue.add(data, options);
    return bootCollectingStartQueue;
  } catch (error) {}
};

bootCollectingStartQueue.process(bootCollectingStartTimerProcess);

export default bootCollectingStartTimer;
