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

export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);

    const { sortBy, sortOrder } = parseSortParams(req.query);

    const filter = parseFilterParams(req.query);

    filter.userId = req.user._id;

    const { data: contacts, totalItems } = await getAllContacts({
      page,
      perPage,
      sortBy,
      sortOrder,
      filter,
    });

    const totalPages = Math.ceil(totalItems / perPage);

    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    res.json({
      status: 200,
      message: "Successfully found contacts!",
      data: {
        data: contacts,
        page,
        perPage,
        totalItems,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getContactByIdController = async (req, res) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact || contact.userId.toString() !== req.user._id.toString()) {
      throw createHttpError(404, 'Contact not found or access denied');
    }

    res.json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
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
    const { contactId } = req.params;

    const contact = await getContactById(contactId);

    if (!contact || contact.userId.toString() !== req.user._id.toString()) {
      return next(createHttpError(404, 'Contact not found or access denied'));
    }

    await deleteContact(contactId);

    res.status(204).send();
};

export const upsertContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const existingContact = await getContactById(contactId);

  if (!existingContact) {

    const contactData = {
      ...req.body,
      userId: req.user._id,
    };
    const newContact = await createContact(contactData);
    return res.status(201).json({
      status: 201,
      message: `Successfully created a contact!`,
      data: newContact,
    });
  }

  if (existingContact.userId.toString() !== req.user._id.toString()) {
    return next(createHttpError(403, 'Access denied to this contact'));
  }

  const updatedContact = await updateContact(contactId, req.body);

  res.status(200).json({
    status: 200,
    message: `Successfully updated the contact!`,
    data: updatedContact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId);

  if (!contact || contact.userId.toString() !== req.user._id.toString()) {
    return next(createHttpError(404, 'Contact not found or access denied'));
  }

  const updatedContact = await updateContact(contactId, req.body);

  res.json({
    status: 200,
    message: `Successfully patched the contact!`,
    data: updatedContact,
  });
};
