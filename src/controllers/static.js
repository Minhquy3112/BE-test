import Bill from "../models/bill";
import moment from "moment";


const aggregateTotalPrice = async (matchExpression) => {
  try {
    const aggregatedResults = await Bill.aggregate([
      {
        $match: matchExpression,
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    if (!aggregatedResults || aggregatedResults.length === 0) {
      return 0;
    }

    return aggregatedResults[0].total;
  } catch (error) {
    throw error;
  }
};

export const getTotalPriceByDate = async (req, res) => {
  try {
    const { selectedYear, selectedMonth, selectedDay } = req.body;

    if (!selectedYear || !selectedMonth || !selectedDay) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn năm, tháng và ngày!" });
    }

    const matchExpression = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$createdAt" }, parseInt(selectedYear)] },
          { $eq: [{ $month: "$createdAt" }, parseInt(selectedMonth)] },
          { $eq: [{ $dayOfMonth: "$createdAt" }, parseInt(selectedDay)] },
        ],
      },
    };

    const totalPrice = await aggregateTotalPrice(matchExpression);

    return res.status(200).json({
      message: `Lấy tổng giá trị cho ngày ${selectedDay}/${selectedMonth}/${selectedYear} thành công!`,
      totalPrice,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getTotalPriceByWeek = async (req, res) => {
  try {
    const { selectedYear, selectedMonth, selectedWeek } = req.query;

    if (!selectedYear || !selectedMonth || !selectedWeek) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn năm, tháng và tuần!" });
    }

    const matchExpression = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$createdAt" }, parseInt(selectedYear)] },
          { $eq: [{ $month: "$createdAt" }, parseInt(selectedMonth)] },
          { $eq: [{ $week: "$createdAt" }, parseInt(selectedWeek)] },
        ],
      },
    };

    const totalPrice = await aggregateTotalPrice(matchExpression);

    return res.status(200).json({
      message: `Lấy tổng giá trị cho tuần ${selectedWeek} của tháng ${selectedMonth}/${selectedYear} thành công!`,
      totalPrice,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getTotalPriceByMonth = async (req, res) => {
  try {
    const { selectedYear, selectedMonth } = req.query;

    if (!selectedYear || !selectedMonth) {
      return res.status(400).json({ message: "Vui lòng chọn năm và tháng!" });
    }

    // Sử dụng moment.js để xác định số ngày trong tháng
    const daysInMonth = moment(`${selectedYear}-${selectedMonth}`, "YYYY-MM").daysInMonth();

    // Tạo mảng chứa các biểu thức $match cho từng ngày trong tháng
    const dailyMatchExpressions = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1; // index + 1 vì ngày trong tháng là từ 1 đến daysInMonth
      return {
        $and: [
          { $expr: { $eq: [{ $year: "$createdAt" }, parseInt(selectedYear)] } },
          { $expr: { $eq: [{ $month: "$createdAt" }, parseInt(selectedMonth)] } },
          { $expr: { $eq: [{ $dayOfMonth: "$createdAt" }, day] } },
        ],
      };
    });

    // Tính tổng doanh thu cho từng ngày trong tháng
    const dailyTotalPrices = await Promise.all(
      dailyMatchExpressions.map((expression) => aggregateTotalPrice(expression))
    );

    return res.status(200).json({
      message: `Lấy tổng giá trị cho tháng ${selectedMonth}/${selectedYear} thành công!`,
      dailyTotalPrices,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getTotalPriceByYear = async (req, res) => {
  try {
    const { selectedYear } = req.query;

    if (!selectedYear) {
      return res.status(400).json({ message: "Vui lòng chọn năm!" });
    }

    const matchExpression = {
      $expr: { $eq: [{ $year: "$createdAt" }, parseInt(selectedYear)] },
    };

    // Tạo mảng chứa các biểu thức $match cho từng tháng
    const monthlyMatchExpressions = Array.from({ length: 12 }, (_, index) => {
      return {
        $and: [
          matchExpression,
          {
            $expr: {
              $eq: [{ $month: "$createdAt" }, index + 1], // index + 1 vì tháng trong MongoDB là từ 1 đến 12
            },
          },
        ],
      };
    });

    // Tính tổng doanh thu cho từng tháng
    const monthlyTotalPrices = await Promise.all(
      monthlyMatchExpressions.map((expression) => aggregateTotalPrice(expression))
    );

    return res.status(200).json({
      message: `Lấy tổng giá trị cho năm ${selectedYear} thành công!`,
      monthlyTotalPrices,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};




