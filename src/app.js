import express from "express";
import productRouter from "./routes/product";
import authRouter from "./routes/auth";
import categoryRouter from "./routes/category";
import cartRouter from "./routes/cart";
import materialRouter from "./routes/material";
import originRouter from "./routes/origin";
import userRouter from "./routes/user";
import billRouter from"./routes/bill"
import mongoose from "mongoose";
import cors from "cors"
import staticRouter from"./routes/static"



const app = express();
app.use(cors());
//middleware
app.use(express.json());

// router
app.use("", productRouter);
app.use("", categoryRouter);
app.use("", authRouter);
app.use("", cartRouter);
app.use("", materialRouter);
app.use("", originRouter);
app.use("", userRouter);
app.use("", billRouter);
app.use("", staticRouter);


mongoose.connect("mongodb://127.0.0.1:27017/duantotnghiep");

export const viteNodeApp = app;