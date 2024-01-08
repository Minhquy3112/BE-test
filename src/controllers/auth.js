import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv"
import User from "../models/user";
import jwt from "jsonwebtoken"
import { signinSchema, signupSchema } from "../schemas/auth"

dotenv.config();

const {SECRET_KEY} = process.env

export const signup = async (req, res) => {
    try {
        // Tạo liên kết xác thực
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const link = `http://localhost:3000/signin?token=${token}`;
        const { name, email, password } = req.body;

        const { error } = signupSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((err) => err.message);
            return res.status(400).json({
                message: errors,
            });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: "Tài khoản đã tồn tại",
            });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        user.password = undefined;

        // Gửi email khi đăng ký thành công
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: `${process.env.MAIL_USERNAME}`,
                pass: `${process.env.MAIL_PASSWORD}`,
            },
        });
        const mailOptions = {
            from: `${process.env.MAIL_FROM_ADDRESS}`,
            to: email,
            subject: 'Xác thực tài khoản',
            text: `Chào mừng ${name} đến với trang web của chúng tôi. Vui lòng nhấp vào liên kết sau để xác thực tài khoản của bạn: ${link}`,
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(400).json({
                    message: error
                })
            } else {
                return res.status(200).json({
                    message: info.response
                })
            }
        });

        return res.status(201).json({
            message: "Đăng ký thành công. Vui lòng kiểm tra email của bạn để xác thực tài khoản và đăng nhập",
            user,
        });
    } catch (error) {
        return res.status(404).json({
            message: error.message,
        })
    }
};

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { error } = signinSchema.validate(req.body, { abortEarly: false });
        //validate
        if (error) {
            const errors = error.details.map((err) => err.message);
            return res.status(400).json({
                message: errors,
            });
        }

        //kiểm tra email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Tài khoản không tồn tại",
            });
        }
        // nó vừa mã hóa và vừa so sánh
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Sai mật khẩu",
            });
        }

        user.password = undefined;
        // tạo token từ server
        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: 60 * 60 });

        return res.status(201).json({
            message: "Đăng nhập thành công",
            accessToken: token,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
     }
};