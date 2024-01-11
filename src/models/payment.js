import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Payment = new Schema(
    {
        user_bank: { type: Schema.Types.ObjectId, ref: "User" },
        user_receiver: { type: Schema.Types.ObjectId, ref: "User" },
        bank_code: {
            type: String,
            require: true
        },
        totalOrder: { type: Schema.Types.Number, ref: "Bill" },
        totalPrice: { type: Schema.Types.Number, ref: "Bill" },
        language: { type: String, require: true}
    },
    { collection: "payment", timestamps: true }
);

const PaymentModel = mongoose.model("payment", Payment);

export default PaymentModel;