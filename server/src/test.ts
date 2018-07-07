require("source-map-support").install();
import * as _ from "lodash";



import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env") });
import { db } from "./config";
import {authHandler} from "./handlers";

const _q = `INSERT INTO info (uid, email, firstName, lastName, _groupMemberships) VALUES ('qwetyuddfgsd', 'email@domain.', 'fi','lastN', 4 )`
/* const _q1 = `SELECT id  FROM info WHERE email = 'ataul443@gmail.com'`; 
db.query(_q1).then(data=>console.log(data)); */

/* db.onUser.check('ataul443h@gmail.com').then(data=> console.log(data)); */
/* db.query(_q)
  .then(data => {
    console.log(data.data.insertId);
    //
  })
  .catch(e => {
    console.log(`From db.query; ${e}`);
  }); */

  //db.onUser.create('newbnda6f','test@domainpgk.com','testf','ltest','plfgjhplplpl').then(data=>console.log(data));
/* db.rights.onRow(5,4,'info').then(d=>{
  console.log(d);
}); */
 //authHandler.login('test@domainpk.com','plplplpl').then(data=>console.log(data));
  /* let _i = db.rights.onTable(0,8,'info');
  let _p = db.rights.onTable(0,8,'secret');
  Promise.all([_i,_p]).then(a=>{
    let p = a.map(obj=>{
      return obj.data;
    });
    console.log(_.union(p[0],p[1]));
  }).catch(e=>console.log(e)); */

  authHandler.signup('test@domafghinpgkfsdgds.com','sdfghj','testf','ltest',8).then(data=>console.log(data));