import * as mysql from "mysql";
import { util } from "../../lib";
import { permitQuery } from "./permit";
import * as _ from "lodash"

export class Database {
  private connection;

  constructor(dbConfig) {
    this.connection = mysql.createConnection(dbConfig);
  }

  query = async (o: string) => {
    let f = () => {
      return new Promise((resolve, reject) => {
        this.connection.query(o, (err, result) => {
          if (err) reject(err);
          else {
            resolve(result);
          }
        });
      });
    };

    const { data, err } = await util.asyncNinja(f);
    if (err) return { err };
    return { data };
  };

  private userExists = async (emailId: string) => {
    const _qUserEixsts = `SELECT id, uid FROM info WHERE email = '${emailId}';`;
    const { data, err } = await this.query(_qUserEixsts);

    if (err) return { err };
    if (data.length !=0 ) return {data: {
      id: data[0].id,
      uuid: data[0].uid
    }};
    else return { data: {
      id: -1,
      uuid: -1
    } };
  };

  private userCreate = async (
    uuid: any,
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ) => {
    const _qLatestId = `SELECT id FROM info ORDER BY id DESC LIMIT 1`;
    const { data, err } = await this.query(_qLatestId);
    if (err) return { err };
    let _nextId = Number(data[0].id);
    _nextId++;

    {
      const _qUserCreate = `INSERT INTO info (uid, email, firstName, lastName,_owner,_group,_status, _groupMemberships) VALUES ('${uuid}', '${email}', '${firstName}','${lastName}',${_nextId},4,2, 4 )`;
      const _qPassCreate = `INSERT INTO secret (password, _owner, _group) VALUES ('${password}', ${_nextId}, 4 )`;
      let _uc = this.query(_qUserCreate);
      let _pc = this.query(_qPassCreate);
      /* const { data, err } = await this.query(_qUserCreate);
      if (err) return { err };
      let _owner = data.insertId; */
      try{
        let _d = await Promise.all([_uc,_pc]);
        return {data: "Ok"};
      }catch(e){
        return {err: e};
      }
    }
  };

  private rightsOnRow = async (id: number, group: number, table: string) => {
    const _q = permitQuery.onRow(id, group, table);
    const { data, err } = await this.query(_q);
    if (err) return { err };
    let _permits = [];
    data.forEach(permit => {
      _permits.push(permit.actions);
    });
    return { data: _permits };
  };

  private rightsOnTable = async (id: number, group: number, table: string) => {
    const _q = permitQuery.onTable(id, group, table);
    const { data, err } = await this.query(_q);
    if (err) return { err };
    let _permits = [];
    data.forEach(permit => {
      _permits.push(permit.actions);
    });
    return { data: _permits };
  };

  onUser = {
    check: this.userExists,
    create: this.userCreate
  };

  rights = {
    onRow: this.rightsOnRow,
    onTable: this.rightsOnTable,
  };
}
