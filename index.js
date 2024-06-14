import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import route from "./src/routes/route.js";

dotenv.config();
const app = express();

app.use(express.urlencoded({ limit: '30mb', extended: false }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.DB_URL)
  .then(() => console.log('Db connected'))
  .catch(err => console.log(err));

app.use('/', route);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
