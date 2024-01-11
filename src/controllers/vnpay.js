import moment from "moment";
// import querystring from "qs";

import Bill from "../models/bill";

const sortObject = (obj) => {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
const config = {
    vnp_TmnCode: "1D7FWNRT",
    vnp_HashSecret: "TBVNRLEVXHMYOZZMXUJOJILRENMGYIUY",
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    vnp_ReturnUrl: "http://localhost:8080/vnpay_ipn"
}

export const createUrl = (res, req) => {
    try {
        // process.env.TZ = 'Asia/Ho_Chi_Minh';
        const { bank_code: bankCode = "", userId, totalOrder, totalPrice, language = "vn" } = req.body;

        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');

        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;


        let tmnCode = config.vnp_TmnCode;
        let secretKey = config.vnp_HashSecret;
        let vnpUrl = config.vnp_Url;
        let returnUrl = config.vnp_ReturnUrl + `userID=${userId}&totalOrder${totalOrder}`;
        let orderId = moment(date).format('DDHHmmss');




        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = language;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = totalPrice * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        return res.json({ url_redierct: vnpUrl, url_return: config.vnp_ReturnUrl });
    } catch (error) {
        //    return res.status(500).json(error.message);
    }
}

export const getDataReturn = async (req, res, next) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        let config = require('config');
        let secretKey = config.get('vnp_HashSecret');
        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

        let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
        //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
        //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

        let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
        let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
        if (secureHash === signed) { //kiểm tra checksum
            if (checkOrderId) {
                if (checkAmount) {
                    if (paymentStatus == "0") { //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                        if (rspCode == "00") {
                            const isMatch = await Bill.findOne({ code: vnp_Params["vnp_TxnRef"] });
                            if (!isMatch) {
                                const newPayment = await Bill.create({
                                    userId,
                                    totalPrice: vnp_Params["vnp_Amount"] / 100,
                                    code: vnp_Params["vnp_TxnRef"],
                                    message: vnp_Params["vnp_OrderInfo"],
                                    paymentMethod: "BankTransfer",
                                    status: "success",
                                });
                                //thanh cong
                                //paymentStatus = '1'
                                // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                                // res.status(200).json({RspCode: '00', Message: 'Success'})
                                res.redirect(
                                    process.env.NODE_URL_CLIENT +
                                    `/checkout?mode=order&code=${vnp_Params["vnp_TxnRef"]}&payment_id=${newPayment._id}`
                                );
                            }
                            else {
                                //that bai
                                //paymentStatus = '2'
                                // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                                // res.status(200).json({RspCode: '00', Message: 'Success'})
                                res.redirect(process.env.NODE_URL_CLIENT + "/checkout");
                            }
                        }
                        else {
                            res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' })
                        }
                    }
                    else {
                        res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
                    }
                }
                else {
                    res.status(200).json({ RspCode: '01', Message: 'Order not found' })
                }
            }
            else {
                res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
            }
        }
    } catch (error) {

    }
}