import mongoose from "mongoose";

const connectToMongo = async () => {
	mongoose.connect(process.env.DATABASE_URI).catch((err) => {
		throw err;
	});
	mongoose.connection.on("error", (error) => {
		throw error;
	});
	mongoose.connection.once("open", () => console.log("Connected to mongodb"));
};

export default connectToMongo;
