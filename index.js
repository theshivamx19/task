import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from "cookie-parser";
import route from "./src/routes/route.js";
const app = express()
app.use(express.json())
app.use(cookieParser())

mongoose.connect(process.env.DB_URL)
.then(() => console.log('Db connected'))
.catch(err => console.log(err))

app.use('/', route)

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})