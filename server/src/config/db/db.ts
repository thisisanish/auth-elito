import { Database } from "./dbUtil";

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DATABASE_NAME,
};

export const db = new Database(DB_CONFIG);
