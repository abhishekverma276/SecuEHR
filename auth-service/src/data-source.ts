import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import path from "path";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres", 
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "postgres",
  synchronize: false,    // make false for production
  logging: false,
  entities: [
    process.env.NODE_ENV === "production"
      ? path.join(__dirname, "entity/**/*.js")
      : path.join(__dirname, "src/entity/**/*.ts")
    //"src/entity/**/*.ts"
  ],
  migrations: [
    process.env.NODE_ENV === "production"
    ? path.join(__dirname, "migration/**/*.js")
    : path.join(__dirname, "src/migration/**/*.ts")
  ],
  subscribers: [],
});

// AppDataSource.initialize()
//     .then(() => {
//     // console.log("Data Source has been initialized!");
//   })
//   .catch((err) => {
//     // console.error("Error during Data Source initialization:", err);
//   });
