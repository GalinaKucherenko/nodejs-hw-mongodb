import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Contact name should be a string',
    'string.min': 'Contact name should have at least {#limit} characters',
    'string.max': 'Contact name should have at most {#limit} characters',
    'any.required': 'Contact name is required',
  }),
  email: Joi.string().min(3).max(50).email().required().messages({
    'string.email': 'Please provide a valid email',
  }),
  phoneNumber: Joi.string().min(6).max(16).required().messages({
    'string.pattern.base': 'Phone number should have between 6 and 16 digits',
    'any.required': 'Phone number is required',
  }),
  contactType: Joi.string().min(3).max(20).required(),
  isFavourite: Joi.boolean().optional(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Contact name should be a string',
    'string.min': 'Contact name should have at least {#limit} characters',
    'string.max': 'Contact name should have at most {#limit} characters',
  }),
  email: Joi.string().min(3).max(50).email().messages({
    'string.email': 'Please provide a valid email',
  }),
  phoneNumber: Joi.string().min(6).max(16).messages({
    'string.pattern.base': 'Phone number should have between 6 and 16 digits',
  }),
  contactType: Joi.string().min(3).max(20),
  isFavourite: Joi.boolean(),
}).min(1);

const dataToValidate = {
  name: 'John Doe',
  phoneNumber: '123456789',
  email: 'john.doe@example.com',
  contactType: 'personal',
  isFavourite: true,
};

const validationResult = createContactSchema.validate(dataToValidate, {
  abortEarly: false,
});

if (validationResult.error) {
  console.error(validationResult.error.details.map(err => err.message).join(', '));
} else {
  console.log('Data is valid!');
}
