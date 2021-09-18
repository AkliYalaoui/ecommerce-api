import Joi from "joi";

export function registerValidation(data) {
	const validationSchema = new Joi.object({
		email: Joi.string().email().required().max(255),
		password: Joi.string().required().min(8).max(255),
		username: Joi.string().alphanum().required().min(6).max(255),
		birthday: Joi.date().required(),
		adress: Joi.string().required(),
	});
	return validationSchema.validate(data);
}

export function loginValidation(data) {
	const validationSchema = new Joi.object({
		email: Joi.string().email().required().max(255),
		password: Joi.string().required().min(8).max(255),
	});
	return validationSchema.validate(data);
}
