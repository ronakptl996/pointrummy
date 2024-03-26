import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";

const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV } =
  config.getConfig();

const SchedulerRedisConfig = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password: String(REDIS_AUTH),
};

let waitingForPlayerTimerStartQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for Production
} else {
  waitingForPlayerTimerStartQueue = new Bull(
    `waitingForPlayerTimerStart_Rummy`,
    {
      redis: SchedulerRedisConfig,
    }
  );
}

const cancelWaitingForPlayerTimer = async (jobId: any, tableId: string) => {
  try {
    const job = await waitingForPlayerTimerStartQueue.getJob(jobId);
    Logger.info(tableId, `---- cancelWaitingForPlayerTimer ::=>> ${jobId}`);
    if (job) {
      Logger.info(tableId, "job : cancelWaitingForPlayerTimer :: success");
      await job.remove();
    }
  } catch (error) {
    Logger.error(tableId, error);
  }
};

export default cancelWaitingForPlayerTimer;
