import express from "express";
import { config as dotEnv } from "dotenv";
import authRouter from "./routes/api/auth.js";
import connectToMongo from "./controllers/DatabaseController.js";

dotEnv();
const APP = express();

connectToMongo();

APP.use(express.json());
APP.use(express.urlencoded({ extended: false }));

APP.use("/api/auth", authRouter);

const PORT = process.env.PORT;
APP.listen(PORT, () => console.log(`server running on port ${PORT}`));
