import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
	_userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "user",
	},
	token: {
		type: String,
		required: true,
	},
	expireAt: { type: Date, default: Date.now, index: { expires: 3600 } },
});

const Token = mongoose.model("token", tokenSchema);

export default Token;
