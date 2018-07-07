const mysql = require("mysql");
const sh = require("child_process");

const db = mysql.createConnection({host: "database",port: 3306, user: "root", password: "Allofusare1@",database:"auth"})


db.query("Select * from auth.info;",(err,rows)=>{
  if(err){
    console.log("unavailable");
    process.exit(1);
  }
  console.log("available");
  process.exit();
})
