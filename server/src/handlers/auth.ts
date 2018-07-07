import { db } from "../config";
import { util, tokenManager } from "../lib";
import { v1 as uuid } from "uuid";
import * as _ from "lodash";

async function signupHandler(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  userGroup: number
) {
  {
    try {
      let _i = db.rights.onTable(0, userGroup, "info");
      let _p = db.rights.onTable(0, userGroup, "secret");
      let _permits = await Promise.all([_i, _p]);
      let p = _permits.map(v => {
        return v.data;
      });
      let _unionPermits = _.union(p[0], p[1]);
      if (_unionPermits.indexOf("create") == -1) return { err: "AccessDenied" };
    } catch (e) {
      return { err: e };
    }
  }

  const { data, err } = await db.onUser.check(email);
  if (err) return { err: "InternalError" };
  else if (data.id != -1) return { err: "UserExists" };
  let uid = uuid();

  {
    const { err } = await db.onUser.create(
      uid,
      email,
      firstName,
      lastName,
      password
    );
    if (err) return { err: "InternalError" };
  }

  {
    const { data, err } = await _issueTokens(uid, password, "elito", 4);
    if (err) return { err: "InternalError" };
    return { data: data };
  }
}

async function loginHandler(email: string, password: string) {
  const { data, err } = await db.onUser.check(email);
  if (err) return { err: "InternalError" };
  if (data.id == -1) return { err: "UserNotExist" };
  let _id = data.id;
  let _uuid = data.uuid;
  {
    let {data, err} = await db.rights.onRow(_id, 4, 'secret');
    if(err) return {err};
    if(data.indexOf("read") == -1) return {err: 'AccessDenied'};
  }
  {
    const _qPass = `SELECT password FROM secret WHERE id = ${_id}`;
    const { data, err } = await db.query(_qPass);
    if (err) return { err };
    if (data[0].password != password) return { err: "PasswordInvalid" };
  }

  {
    const { data, err } = await _issueTokens(_uuid, password, "elito", 4);
    if (err) return { err: "InternalError" };
    return { data: data };
  }
}

async function _issueTokens(
  uuid: string,
  password: string,
  aud: string,
  roles: number
) {
  let _a = tokenManager.accessToken(uuid, aud, roles);
  let _r = tokenManager.refreshToken(uuid, password);

  let _tokens = await Promise.all([_a, _r]);
  let a = _tokens[0];
  let r = _tokens[1];
  if (a.err || r.err)
    return {
      err: {
        accessToken: a.err,
        refreshToken: r.err
      }
    };
  return {
    data: {
      refreshToken: r.data,
      accessToken: a.data
    }
  };
}

export let authHandler = {
  signup: signupHandler,
  login: loginHandler
};
