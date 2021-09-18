import { Router } from "express";
import {
	register,
	login,
	getUser,
	confirmEmail,
	resendVerification,
} from "../../controllers/AuthController.js";
import { auth } from "../../middlewares/authMiddleware.js";

const router = Router();

// @url POST /api/auth/register
// @desc register a new user
// @type PUBLIC
router.post("/register", register);

// @url POST /api/auth/login
// @desc login a user
// @type PUBLIC
router.post("/login", login);

// @url POST /api/auth/login
// @desc login a user
// @type PUBLIC
router.get("/confirmation/:email/:token", confirmEmail);

// @url POST /api/auth/login
// @desc login a user
// @type PUBLIC
router.post("/confirmation", resendVerification);

// @url GET /api/auth
// @desc get user info
// @type PRIVATE
router.get("/", auth, getUser);

export default router;
