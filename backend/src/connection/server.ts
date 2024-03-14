import http from "http";
import path from "path";
import config from "../config";
import fs from "graceful-fs";
import https from "https";
import express from "express";
import bodyParser from "body-parser";

const { HTTPS_KEY, HTTPS_CERT } = config.getConfig();
const app = express();

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 1000000,
  })
);

app.use(express.json({ limit: "50mb" }));

let httpServer: any;

if (
  fs.existsSync(path.join(__dirname, HTTPS_KEY)) &&
  fs.existsSync(path.join(__dirname, HTTPS_CERT))
) {
  let options = {
    key: fs.readFileSync(path.join(__dirname, HTTPS_KEY)),
    cert: fs.readFileSync(path.join(__dirname, HTTPS_CERT)),
  };

  console.log("Creating HTTPS app");
  httpServer = https.createServer(options, app);
} else {
  console.log("Creating HTTP app");
  httpServer = http.createServer(app);
}

export default { serverConnect: httpServer };
