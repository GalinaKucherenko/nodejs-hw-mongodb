import {
    getAllContacts,
    getContactById,
    createContact,
    deleteContact,
    updateContact,
} from "../services/contacts.js";
import createHttpError from "http-errors";
import { parsePaginationParams } from "../utils/parsePaginationParams.js";
import { parseSortParams } from "../utils/parseSortParams.js";
import { parseFilterParams } from "../utils/parseFilterParams.js";
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';

export const getContactsController = async (req, res, next) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const { _id: userId } = req.user;

  const data = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter: {...filter, userId},
  });

  res.json({
    status: 200,
    message: "Successfully found contacts!",
    data,
  });
};

export const getContactByIdController = async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user;
  const data = await getContactById(id, userId);

    if (!data) {
      throw createHttpError(404, `Contact with id=${id} not found`);
    }

    res.json({
        status: 200,
        message: `Successfully found contact with id ${id}!`,
        data,
    });
};

export const createContactController = async (req, res) => {
  const contactData = {
    ...req.body,
    userId: req.user._id,
  };
    const contact = await createContact(contactData);

    res.status(201).json({
    status: 201,
    message: `Successfully created a contact!`,
    data: contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { id } = req.params;
  const { _id: userId } = req.user;
  const data = await deleteContact({_id: id, userId});

    if (!data) {
      throw createHttpError(404, `Contact with id=${id} not found`);
    }

    res.status(204).send();
};

export const upsertContactController = async (req, res, next) => {
  const { id } = req.params;
  const { _id: userId } = req.user;
  const { isNew, data } = await updateContact(
    { _id: id, userId },
    req.body,
    { upsert: true },
  );

  const status = isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully created a contact!`,
    data,
  });
};

export const patchContactController = async (req, res, next) => {
  const { id } = req.params;
  const { _id: userId } = req.user;

  const photo = req.file;
  let photoUrl;
  if (photo) {
    photoUrl = await saveFileToUploadDir(photo);
  }

  const result = await updateContact(id, userId, { ...req.body, photo: photoUrl });
  if (!result) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.json({
    status: 200,
    message: 'Successfully patched the contact!',
    data: result.data,
  });
};
