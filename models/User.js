import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			min: 8,
		},
		birthday: {
			type: Date,
			required: true,
		},
		adress: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		isVerified: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const User = mongoose.model("user", userSchema);

export default User;
