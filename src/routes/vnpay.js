import express from "express";
import { getDataReturn } from "../controllers/vnpay";
import { Create } from "../controllers/payment";



const routerPayment = express.Router();

routerPayment.post("/create-url", Create);
routerPayment.get("/vnpay_ipn", getDataReturn);

export default routerPayment;