import * as _ from "lodash";
import { authHandler } from "../handlers";

const MIN_EMAIL_LENGTH = 3;
const MIN_NAME_LENGTH = 3;
const MAX_EMAIL_LENGTH = 255;
const MAX_NAME_LENGTH = 64;
const GUEST_USER_GROUP = 8;

function validateUsername(username: string) {
  let patternEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  let flag: Boolean = patternEmail.test(username);
  let _u = username.trim();
  if (
    !flag ||
    username.length > MAX_EMAIL_LENGTH ||
    username.length < MIN_EMAIL_LENGTH
  ) {
    return { err: "UsernameInvalid" };
  }
  return { data: _u.toLowerCase() };
}

function validateNames(firstName: string, lastName: string) {
  let _f = firstName.trim();
  let _l = lastName.trim();
  let patternF = /^[a-zA-z]+$/g;
  let patternL = /^[a-zA-z]+$/g;

  if (
    !patternF.test(_f) || !patternL.test(_l) ||
    (_f.length < MIN_NAME_LENGTH || _l.length < MIN_NAME_LENGTH) ||
    (_f.length > MAX_NAME_LENGTH || _l.length > MAX_NAME_LENGTH)
  ) {
    return { err: "namesInvalid" };
  }
  return {
    data: {
      firstName: _f.toLowerCase(),
      lastName: _l.toLowerCase()
    }
  };
}

async function signup(request) {
  let email = request.username;
  let password = request.password;
  let firstName = request.firstName;
  let lastName = request.lastName;
  let userGroup = GUEST_USER_GROUP;
  {
    const { data, err } = validateUsername(email);
    if (err) return { err };
    email = data;
  }
  {
    const { data, err } = validateNames(firstName, lastName);
    if (err) return { err };
    firstName = data.firstName;
    lastName = data.lastName;
  }
  let _response;
  {
    const { data, err } = await authHandler.signup(
      email,
      password,
      firstName,
      lastName,
      userGroup
    );
    if (err) return { err };
    _response = data;
  }
  return {
    data: {
      status: "ok",
      accessToken: _response.accessToken,
      refreshToken: _response.refreshToken,
      time: new Date().toString()
    }
  };
}

async function login(request: LoginRequest) {
  let email = request.username;
  let password = request.password;

  {
    const { data, err } = validateUsername(email);
    if (err) return { err };
    email = data;
  }

  let _response = null;
  {
    const { data, err } = await authHandler.login(email, password);
    if (err) return { err };
    _response = data;
  }
  return {
    data: {
      status: "ok",
      accessToken: _response.accessToken,
      refreshToken: _response.refreshToken,
      time: new Date().toString()
    }
  };
}

export let authController = {
  login,
  signup
};

interface LoginRequest {
  username: string;
  password: string;
}

interface SignupRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface Response {
  accessToken?: string;
  refreshToken?: string;
  status: string;
  errors?: string[];
  time: string;
}
