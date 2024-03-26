import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import url from "url";
import watingForPlayerTimerStartProcess from "../processes/waitingForPlayerTimerStart.process";

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

let waitingForPlayerTimerStartQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) Production
} else {
  waitingForPlayerTimerStartQueue = new Bull(
    `waitingForPlayerTimerStart_Rummy`,
    {
      redis: SchedulerRedisConfig,
    }
  );
}

const waitingForPlayerTimerStart = async (data: any) => {
  const tableId = data.tableId;

  try {
    Logger.info(
      tableId,
      `---- waitingForPlayerTimerStart ::=>> ${JSON.stringify(data)}`
    );

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    await waitingForPlayerTimerStartQueue.add(data, options);
    return waitingForPlayerTimerStartQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

waitingForPlayerTimerStartQueue.process(watingForPlayerTimerStartProcess);

export default waitingForPlayerTimerStart;
