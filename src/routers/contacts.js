import { Router } from "express";

import {
  getContactsController,
  getContactByIdController,
  createContactController,
  deleteContactController,
  upsertContactController,
  patchContactController,
} from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";

import { validateBody } from "../middlewares/validateBody.js";
import { createContactSchema, updateContactSchema } from "../validation/contacts.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  checkRoles(ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER),
  ctrlWrapper(getContactsController)
);

router.get(
  '/:contactId',
  checkRoles(ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER),
  isValidId,
  ctrlWrapper(getContactByIdController)
);

router.post(
  '/',
  checkRoles(ROLES.ADMIN, ROLES.MODERATOR),
  validateBody(createContactSchema),
  ctrlWrapper(createContactController)
);

router.delete(
  '/:contactId',
  checkRoles(ROLES.ADMIN, ROLES.MODERATOR),
  isValidId,
  ctrlWrapper(deleteContactController)
);
router.put(
  '/:contactId',
  checkRoles(ROLES.ADMIN, ROLES.MODERATOR),
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(upsertContactController)
);

router.patch(
  '/:contactId',
  checkRoles(ROLES.ADMIN, ROLES.MODERATOR),
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController)
);

export default router;
