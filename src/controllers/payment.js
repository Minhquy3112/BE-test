import PaymentModel from "../models/payment";

export const Create = async (req, res) => {
    try {
      const newPayment = await PaymentModel.create(req.body);
      return res.json({
        message: "Bạn đã thanh toán thành công",
        newPayment,
      });
    } catch (error) {
      return res.status(400).json({
        message: error,
      });
    }
  };