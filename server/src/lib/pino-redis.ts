const Writable = require("readable-stream").Writable;
const Redis = require("ioredis");
const Parse = require("fast-json-parse");
const split = require("split2");
const pump = require("pump");
const zlib = require("zlib");
const minimist = require("minimist");
const fs = require("fs");
const path = require("path");


const levelInt = {
  60: "fatal",
  50: "error",
  40: "warn",
  
  30: "info",
  20: "debug",
  10: "trace"
};

export function pinoRedis(opts) {
  console.log("Pino-Redis Pipeline Started...");
  const splitter = split(function(line) {
    const parsed = new Parse(line);
    if (parsed.err) {
      this.emit("unknown", line, parsed.err);
      return;
    }

    return parsed.value;
  });

  const redis = opts.redisClient;

  const writable = new Writable({
    objectMode: true,
    writev(chunks, cb) {
      const pipeline = redis.pipeline();
      chunks.forEach(item => {
        const body = item.chunk;
        if (!body.time || !body.host)
          throw new Error(
            "Timetsamps  or Hostname are not enables in pino logger instance!"
          );

        const ttl = opts.expireDuration;
        const gzip = !!body.gzip;
        const value = JSON.stringify(body);
        const redisKey = `${levelInt[body.level]}:${body.host}`;
        if (gzip) {
          zlib.gzip(value, (c_err, buffer) => {
            if (!c_err) {
              if (opts.includeLevels.indexOf(levelInt[body.level]) != -1) {
                //pipeline.setex(redisKey, ttl, buffer.toString("binary"));
                pipeline.zadd(redisKey, body.time, buffer.toString("binary"));
              }
            } else {
              splitter.emit("insertError", c_err);
            }
          });
        } else {
          if (opts.includeLevels.indexOf(levelInt[body.level]) != -1) {
            //pipeline.setex(redisKey, ttl, value);
            pipeline.zadd(redisKey, body.time, value);
          }
        }

        pipeline.exec((err, result) => {
          if (!err) {
            result.forEach(res => {
              if (!res[0]) {
                splitter.emit("insert", body);
              } else {
                splitter.emit("insertError", res);
              }
            });
          } else {
            splitter.emit("insertError", err);
          }
          cb();
        });
      });
    },
    write(body, enc, cb) {
      if (!body.time || !body.host)
        throw new Error(
          "Timetsamps or Hostname are not enables in pino logger instance!"
        );

      const ttl = opts.expireDuration;
      const gzip = !!body.gzip;
      const value = JSON.stringify(body);

      const redisKey = `${levelInt[body.level]}:${body.host}`;
      if (gzip) {
        zlib.gzip(value, (c_err, buffer) => {
          if (!c_err) {
            if (opts.includeLevels.indexOf(levelInt[body.level]) != -1) {
              redis.zadd(
                redisKey,
                body.time,
                buffer.toString("binary"),
                (err, result) => {
                  if (!err) {
                    splitter.emit("insert", body);
                  } else {
                    splitter.emit("insertError", err);
                  }
                  cb();
                }
              );
            }
          } else {
            splitter.emit("insertError", c_err);
          }
        });
      } else {
        if (opts.includeLevels.indexOf(levelInt[body.level]) != -1) {
          redis.zadd(redisKey, body.time, value, (err, result) => {
            if (!err) {
              splitter.emit("insert", body);
            } else {
              splitter.emit("insertError", err);
            }
            cb();
          });
        }
      }
    }
  });

  pump(splitter, writable);

  return splitter;
}
