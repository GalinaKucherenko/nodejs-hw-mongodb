import { model, Schema } from 'mongoose';
import { ROLES } from '../../constants/index.js';
import { emailRegexp } from '../../constants/users.js';
import { setUpdateOptions, handleSaveError } from "./hooks.js";

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, match: emailRegexp, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.USER, ROLES.MODERATOR, ROLES.GUEST],
      default: ROLES.USER,
    }
  },
  { timestamps: true, versionKey: false },
);

usersSchema.post("save", handleSaveError);
usersSchema.pre("findOneAndUpdate", setUpdateOptions);
usersSchema.post("findOneAndUpdate", handleSaveError);

export const UsersCollection = model('users', usersSchema);

