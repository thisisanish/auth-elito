import * as _ from "lodash";

/* function errorFormatter(mesg: string, error: Object) {
  let _error: any = _.cloneDeep(error);
  _error.mesg = mesg;
  return _error;
} */

function errorCollector(errorObj, errorMesg) {
  let temp = {};
  temp[errorMesg] = true;
  if (!_.has(errorObj, errorMesg)) {
    _.extend(errorObj, temp);
  }
}

function asyncNinja(promise, ...args): DataObject {
  console.log(...args);
  return promise(...args)
    .then(data => ({ data }))
    .catch(err => {
      console.log("Func:", promise.name, "\n", err);
      return { err };
    });
}

export let util = {
  asyncNinja: asyncNinja,
  errorCollector: errorCollector
};

interface DataObject {
  data?: any;
  err?: Error;
}
