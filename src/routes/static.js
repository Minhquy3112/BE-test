// import express from "express";

// import {} from "../controllers/origin";
// import {
//   getToalPrice,
//   getTotalPriceByDay,
//   getTotalPriceByMonth,
//   getTotalPriceByWeek,
//   getTotalPriceByYear,
// } from "../controllers/static";

// const router = express.Router();
// router.get("/toal", getToalPrice);
// router.get("/bydate", getTotalPriceByDay);
// router.get("/bymonth", getTotalPriceByMonth);
// router.get("/byweek", getTotalPriceByWeek);
// router.get("/byyear", getTotalPriceByYear);

// export default router;

// routes/static.js

import express from "express";
import { getToalPrice, getTotalPriceByMonth, getTotalPriceByWeek, getTotalPriceByYear } from "../controllers/static";

const router = express.Router();
router.get("/toal", getToalPrice);
// router.get("/bydate", getTotalPriceByDay);
router.get(`/bymonth`, getTotalPriceByMonth);
router.get(`/byweek`, getTotalPriceByWeek);
router.get(`/byyear`, getTotalPriceByYear);

export default router;

