import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

const processEnv = process.env;
let configData: any = null;

function getEnvJSON() {
  const NODE_ENV = `NODE_ENV`;
  const PORT = "PORT";

  const REDIS_PORT = "REDIS_PORT";
  const REDIS_HOST = "REDIS_HOST";
  const REDIS_DB = "REDIS_DB";
  const REDIS_AUTH = "REDIS_AUTH";

  const pubSubRedisHost = `PUBSUB_REDIS_HOST`;
  const pubSubRedisPort = `PUBSUB_REDIS_PORT`;
  const pubSubRedisPassword = `PUBSUB_REDIS_AUTH`;
  const pubSubRedisDb = `PUBSUB_REDIS_DB`;

  const HTTPS_KEY = "HTTPS_KEY";
  const HTTPS_CERT = "HTTPS_CERT";

  return Object.freeze({
    NODE_ENV: processEnv[NODE_ENV],
    HTTP_SERVER_PORT: processEnv[PORT],
    REDIS_HOST: processEnv[REDIS_HOST],
    REDIS_AUTH: processEnv[REDIS_AUTH],
    REDIS_PORT: processEnv[REDIS_PORT],
    REDIS_DB: processEnv[REDIS_DB],

    PUBSUB_REDIS_HOST: processEnv[pubSubRedisHost],
    PUBSUB_REDIS_PORT: processEnv[pubSubRedisPort],
    PUBSUB_REDIS_AUTH: processEnv[pubSubRedisPassword],
    PUBSUB_REDIS_DB: processEnv[pubSubRedisDb],

    HTTPS_KEY: processEnv[HTTPS_KEY],
    HTTPS_CERT: processEnv[HTTPS_CERT],

    GAME_START_TIMER: 10000,
    NEXT_GAME_START_TIMER: 10000,
    LOCK_IN_TIMER: 5000,
    USER_TURN_TIMER: 30000,
    SECONDARY_TIMER: 15000,
    DECLARE_TIMER: 30000,
    BOOT_COLLECT_TIMER: 3000,
    TOSS_CARD_TIMER: 3000,
    CARD_DEALING_TIMER: 4500,
    REJOIN_TIMER: 60000,
    MORE_THEN_DISTANCE_TO_JOIN: 250,
    ROBOT_SEATNG_IN_TABLE_TIMER: 5000,
    NEW_GAME_START_TIMER: 10000,
    WAIT_FOR_OTHER_PLAYER_TIMER: 30000,
    IS_CLOCKWISE_TURN: false,
    MAXIMUM_TABLE_CREATE_LIMIT: 3,
    CONTINUE_MISSING_TURN_COUNT: 2,
  });
}

function getConfig() {
  configData = getEnvJSON();

  return configData;
}

const exportObject = { getConfig };

export default exportObject;
