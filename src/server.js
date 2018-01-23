import bodyParser from 'body-parser';
import compression from 'compression';
import config from './config';
import cors from 'cors';
import cluster from 'cluster';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import mongoose from 'mongoose';
import os from 'os';
import path from 'path';
import winston from 'winston';
import expressWinston from 'express-winston';
import winstonDailyFileRotote from 'winston-daily-rotate-file';

const routes = require('./routes');

// Initializations
const app = express();
const env = process.env.NODE_ENV || 'development';

// DB Connection
let user = config.databaseUser ? `${config.databaseUser}:${config.databasePassword}@` : '';
mongoose.connect(`mongodb://${user}${config.databaseHost}/${config.databaseName}`);

// Middlewares
app.use(bodyParser.json());
app.use(compression());
app.use(cors());

// Access Logger
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.DailyRotateFile({
      name: 'access.log',
      filename: path.join(__dirname, config.accessLog)
    })
  ]
}));

// Routes
routes.initRoutes(app);

// Error Logger
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      name: 'error.log',
      filename: path.join(__dirname, config.errorLog)
    })
  ]
}));

// Starting server
if (env == 'production' && cluster.isMaster) {
  let cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  if (config.enableSSL) {
    https.createServer({
      key: fs.readFileSync(config.sslKey),
      cert: fs.readFileSync(config.sslCert)
    }, app).listen(config.port, onServerStart);
  } else {
    http.createServer(app).listen(config.port, onServerStart);
  }
}

function onServerStart() {
  console.log(`${env} server running at port ${config.port}`);
}