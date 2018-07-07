import * as dotenv from "dotenv";
import * as path from "path";
import * as jwt from "jsonwebtoken";
import { redis } from "../config";
import { util } from "../lib";
dotenv.config({ path: path.join(__dirname, "..", "..", "keys",".env") });

async function accessToken(subject: string, audience: string, roles: number) {
  let fat = () => {
    return new Promise((resolve, reject) => {
      const payload = {
        iss: process.env.SERVICENAME,
        sub: subject,
        scope: roles,
        aud: audience,
        exp: 60 + Math.floor(Date.now() / 1000),
        iat: Math.floor(Date.now() / 1000),
        nbf: 1 + Math.floor(Date.now() / 1000),
      };
      
      console.log(process.env.JWT_SECRET_PRIVATE);
      const signingSecret = process.env.JWT_SECRET_PRIVATE;

      jwt.sign(payload, signingSecret, { algorithm: "RS256" }, (err, token) => {
        if (err) reject(err);
        else resolve(token);
        
      });
    });
  };

  const { data, err } = await util.asyncNinja(fat);
  if (err) return { err };
  return { data };
}


async function _checkTokenInCache(uuid: string) {
  try {
    let data = await redis.hget(uuid, "refreshToken");
    return { data };
  } catch (err) {
    return { err };
  }
}

async function refreshToken(
  subject: string,
  secret: string,
  validity: number = 1
) {

  {
    const { data, err } = await _checkTokenInCache(subject);
    if (data) return { data };
  }

  let expireAt = validity * 24 * 60 * 60 + Math.floor(Date.now() / 1000);

  let payload = {
    sub: subject,
    iss: process.env.SERVICENAME,
    exp: expireAt,
    nbf: 1 + Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000)
  };


  let signingSecret = secret + process.env.REFRESH_TOKEN_SECRET;

  let fts = () => {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, signingSecret, { algorithm: "HS256" }, (err, token) => {
        if (err) reject(err);
        else resolve(token);
      });
    });
  };

  let _refreshToken = null;
  {
    const { data, err } = await util.asyncNinja(fts);
    if (err) return { err };
    _refreshToken = data;
  }

  try {
    let data = await redis.hmset(
      subject,
      "refreshToken",
      _refreshToken,
      "secret",
      signingSecret
    );
  } catch (err) {
    return { err };
  }

  try {
    let _data = await redis.expire(subject, expireAt);
  } catch (err) {
    return { err };
  }

  return { data: _refreshToken };
}

async function _verifyAccessToken(accessToken: string) {
  let fvat = () => {
    return new Promise((resolve, reject) => {
      jwt.verify(accessToken, process.env.JWT_SECRET_PUBLIC, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  };
  const { data, err } = await util.asyncNinja(fvat);
  if (err) return { err };
  return { data };
}

async function _verifyRefreshToken(refreshToken: string) {
  let decoded: any = jwt.decode(refreshToken, { complete: true });
  let _secret: string = null;

  try {
    let _secret = await redis.hget(decoded.payload.sub, "secret");
  } catch (err) {
    return { err };
  }

  let frt = () => {
    new Promise((resolve, reject) => {
      jwt.verify(refreshToken, _secret, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  };

  {
    const { data, err } = await util.asyncNinja(frt);
    if (err) return { err };
    return { data };
  }
}

async function accessFromRefreshToken(
  _accessToken: string,
  _refreshToken: string
) {
  let refresh: any = jwt.decode(_refreshToken, { complete: true });
  let access: any = jwt.decode(_accessToken, { complete: true });

  if (refresh.header.alg == "none")
    return { err: new Error("Algorithm type 'none' in refresh toke.") };

  let _vR = _verifyRefreshToken(_refreshToken);
  let _vA = _verifyAccessToken(_accessToken);

  {
    let _p = await Promise.all([_vR, _vA]);
    let _resVr = _p[0];
    let _resAr = _p[1];
    if (_resVr.err) return { err: _resVr.err };
    if (_resAr.err) return { err: _resAr.err };
  }

  let _newAccessToken: string = null;

  {
    const { data, err } = await accessToken(
      access.payload.sub,
      access.payload.aud,
      access.payload.roles
    );
    if (err) return { err };
    return { data };
  }
}

export let tokenManager = {
  accessToken: accessToken,
  refreshToken: refreshToken,
  accessFromRefreshToken: accessFromRefreshToken,
  verifyAccess: _verifyAccessToken,
  verifyRefresh: _verifyRefreshToken
};
