import jwt from "jsonwebtoken";

export function auth(req, res, next) {
	const token = req.header("auth-token");

	if (!token)
		return res
			.status(401)
			.json({ errors: [{ msg: "No token, authorization denied" }] });

	try {
		const decoded = jwt.verify(
			req.header("auth-token"),
			process.env.JWT_SECRET
		);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(400).json({
			msg: "Token not valid",
		});
	}
}
