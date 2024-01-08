import nodemailer from "nodemailer";
import dotenv from "dotenv";
export const sendEmailCreateOrder = async (req, res) => {
  const { email } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail", // `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  // send mail with defined transport object
  await transporter.sendMail(
    {
      from: "minhquy311203@gmail.com", // sender address
      to: `${email}`, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    },
    (err) => {
      if (err) {
        return res.json({
          message: "Lỗi",
          err,
        });
      }
      return res.json({
        message: "Đã gửi mail thành công",
      })
    }
  );
};
