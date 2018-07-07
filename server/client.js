const path = require("path");
const grpc = require("grpc");

const PROTO_PATH = path.join(__dirname, "proto", "app.proto");
const helloProto = grpc.load(PROTO_PATH).auth;

let client = new helloProto.AuthMethod(
  "0.0.0.0:5005",
  grpc.credentials.createInsecure()
);

if (process.argv[2] == "--signup") {
  console.log({
    username: process.argv[3],
    password: process.argv[4],
    firstName: process.argv[5],
    lastName: process.argv[6]
  });
  client.signup(
    {
      username: process.argv[3],
      password: process.argv[4],
      firstName: process.argv[5],
      lastName: process.argv[6]
    },
    (error, response) => {
      if (error) {
        console.log(error);
      } else console.log("Done", response);
    }
  );
} else if (process.argv[2] == "--login") {
  client.login(
    { username: process.argv[3], password: process.argv[4] },
    (error, response) => {
      if (error) {
        console.log(error);
      } else console.log("Done", response);
    }
  );
}
