import { Schema, model } from "mongoose";
import { setUpdateOptions, handleSaveError } from "./hooks";

const contactsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    isFavourite: {
      type: Boolean,
      required: false,
    },
    contactType: {
      type: String,
      required: true,
      enum: ['work', 'home', 'personal'],
      default: 'personal',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

contactsSchema.post("save", handleSaveError);
contactsSchema.pre("findOneAndUpdate", setUpdateOptions);
contactsSchema.post("findOneAndUpdate", handleSaveError);

const ContactsCollection = model('contacts', contactsSchema);

export default ContactsCollection;
