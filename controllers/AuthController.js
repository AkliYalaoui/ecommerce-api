import jwt from "jsonwebtoken";
import {
	registerValidation,
	loginValidation,
} from "../validations/AuthValidations.js";
import User from "../models/User.js";
import Token from "../models/Token.js";
import bcryptjs from "bcryptjs";
import sendgridTransport from "nodemailer-sendgrid-transport";
import nodemailer from "nodemailer";
import Joi from "joi";

export async function register(req, res) {
	const { error } = await registerValidation(req.body);
	if (error)
		return res
			.status(400)
			.json({ errors: [{ msg: error.details[0].message }] });

	try {
		const { email, password, username, birthday, adress } = req.body;
		// check if the user exist
		const found = await User.findOne({
			$or: [
				{
					email: req.body.email,
				},
				{
					username: req.body.username,
				},
			],
		}).exec();
		if (found)
			return res.status(400).json({ errors: [{ msg: "User already exist" }] });

		const salt = await bcryptjs.genSalt(10);

		const hashedPassword = await bcryptjs.hash(password, salt);

		const user = new User({
			email,
			password: hashedPassword,
			username,
			birthday,
			adress,
		});

		const savedUser = await user.save();

		const token = jwt.sign({ id: savedUser.id }, process.env.JWT_SECRET, {
			expiresIn: 3600,
		});

		const verificationToken = new Token({
			_userId: savedUser.id,
			token,
		});

		await verificationToken.save();

		const transporter = nodemailer.createTransport(
			sendgridTransport({
				auth: { api_key: process.env.SENDGRID_APIKEY },
			})
		);

		const mailOption = {
			from: "in_fatmi@esi.dz",
			to: user.email,
			subject: "Account Verification Link",
			html: `<div
			style="
				font-family: Arial, Helvetica, sans-serif;
				text-align: center;
				width: 400px;
				border-radius: 6px;
				box-shadow: 0 1px 4px rgb(0 0 0 / 20%);
				padding: 15px;
				margin: auto;
			"
		>
			<h2 style="color: #6d28d9; font-size: 2rem">Hello ${req.body.username}</h2>
			<p style="margin-bottom: 30px">
				Please verify your account by clicking the link:
			</p>
			<a
				style="
					text-decoration: none;
					padding: 10px 15px;
					border-radius: 6px;
					color: #fff;
					background-color: #6d28d9;
				"
				href="http://${req.headers.host}/api/auth/confirmation/${user.email}/${verificationToken.token}">Verify your email</a>
			<h3 style="font-size:.8rem">Thank you</h3>
			<p>Ecommerce app &copy; 2021</p>
		</div>`,
		};

		transporter.sendMail(mailOption);

		return res.status(200).json({
			msg:
				"A verification email has been sent to " +
				user.email +
				". It will be expire after 1 hour. If you not get verification Email click on resend token.",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).send("Server error...");
	}
}

export async function login(req, res) {
	const { error } = await loginValidation(req.body);
	if (error)
		return res
			.status(400)
			.json({ errors: [{ msg: error.details[0].message }] });

	try {
		const { email, password } = req.body;
		// check if the user exist
		const user = await User.findOne({ email: email }).exec();
		if (!user)
			return res.status(400).json({ errors: [{ msg: "User doesn't exist" }] });

		const passwordMatch = await bcryptjs.compare(password, user.password);

		if (!passwordMatch)
			return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });

		if (!user.isVerified)
			return res.status(401).json({
				errors: [{ msg: "Your Email has not been verified" }],
			});

		// create jwt
		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			expiresIn: 36000,
		});

		return res.json({
			token,
			user: {
				email: user.email,
				username: user.username,
				birthday: user.birthday,
				adress: user.adress,
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).send("Server error...");
	}
}

export async function confirmEmail(req, res) {
	try {
		const token = await Token.findOne({ token: req.params.token });
		if (!token)
			return res
				.status(400)
				.json({ errors: [{ msg: "Your verification link may have expired" }] });

		const user = await User.findOne({
			_id: token._userId,
			email: req.params.email,
		});

		if (!user)
			return res.status(401).send({
				errors: [
					{
						msg: "We were unable to find a user for this verification. Please SignUp!",
					},
				],
			});

		if (user.isVerified)
			return res
				.status(200)
				.json({ msg: "User is already verified, try to login right now" });

		await User.updateOne(
			{ _id: user._id },
			{
				$set: { isVerified: true },
			}
		);
		return res.json({ msg: "Your account verified successfuly" });
	} catch (err) {
		console.log(err);
		return res.status(500).send("Server error...");
	}
}

export async function getUser(req, res) {
	try {
		const user = await User.findById(req.user.id).select("-password").exec();
		return res.json(user);
	} catch (err) {
		console.log(err);
		return res.status(500).json("Server error...");
	}
}

export async function resendVerification(req, res) {
	const schema = new Joi.object({
		email: Joi.string().email().required(),
	});
	const { error } = await schema.validate(req.body);
	if (error)
		return res
			.status(400)
			.json({ errors: [{ msg: error.details[0].message }] });

	const { email } = req.body;
	try {
		const user = await User.findOne({ email: email });
		if (!user)
			return res.status(400).json({ errors: [{ msg: "user doesn't exist" }] });
		if (user.isVerified)
			return res
				.status(400)
				.json({ errors: [{ msg: "User already verified" }] });

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			expiresIn: 3600,
		});
		const verificationToken = new Token({
			_userId: user._id,
			token,
		});

		await verificationToken.save();

		const transporter = nodemailer.createTransport(
			sendgridTransport({
				auth: {
					api_key: process.env.SENDGRID_APIKEY,
				},
			})
		);
		const mailOption = {
			from: "in_fatmi@esi.dz",
			to: user.email,
			subject: "Account Verification Link",
			html: `<div
			style="
				font-family: Arial, Helvetica, sans-serif;
				text-align: center;
				width: 400px;
				border-radius: 6px;
				box-shadow: 0 1px 4px rgb(0 0 0 / 20%);
				padding: 15px;
				margin: auto;
			"
		>
			<h2 style="color: #6d28d9; font-size: 2rem">Hello ${req.body.username}</h2>
			<p style="margin-bottom: 30px">
				Please verify your account by clicking the link:
			</p>
			<a
				style="
					text-decoration: none;
					padding: 10px 15px;
					border-radius: 6px;
					color: #fff;
					background-color: #6d28d9;
				"
				href="http://${req.headers.host}/api/auth/confirmation/${user.email}/${verificationToken.token}">Verify your email</a>
			<h3 style="font-size:.8rem">Thank you</h3>
			<p>Ecommerce app &copy; 2021</p>
		</div>`,
		};
		await transporter.sendMail(mailOption);
		return res.json({
			msg:
				"A verification email has been sent to " +
				user.email +
				". It will be expire after 1 hour. If you not get verification Email click on resend token.",
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send("server error...");
	}
}
