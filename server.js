import express from "express";
import {config as dotEnv} from "dotenv";

dotEnv();
const APP = express();
const PORT = process.env.PORT;

APP.listen(PORT,() => console.log(`server running on port ${PORT}`));