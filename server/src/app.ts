require("source-map-support").install();
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import * as grpc from "grpc";
import { authController } from "./controllers";
import { db } from "./config";

const PROTO_PATH = path.join(__dirname, "..", "proto", "app.proto");

const appPrto = grpc.load(PROTO_PATH).auth;

const server = new grpc.Server();

function _signup(call, callback) {
  authController.signup(call.request).then(response => {
    console.log(response);
    if (response.err)
      callback(null, {
        status: "FAILED",
        error: response.err,
        time: new Date().toString()
      });
    else callback(null, response.data);
  });
}

function _login(call, callback) {
  authController.login(call.request).then(response => {
    console.log(response);
    if (response.err)
      callback(null, {
        status: "FAILED",
        error: response.err,
        time: new Date().toString()
      });
    else callback(null, response.data);
  });
}

server.addService(appPrto.AuthMethod.service, {
  signup: _signup,
  login: _login
});

process.on("unhandledRejection", err => {
  console.log("\n\nUnhandled Rejection:", err);
});

process.on("uncaughtException", err => {
  console.log("\n\nUncaught Exception", err);
});

server.bind(
  `0.0.0.0:${process.env.PORT || 50051}`,
  grpc.ServerCredentials.createInsecure()
);
server.start();
console.log(`"Start listening at....${process.env.PORT || 50051}`);
