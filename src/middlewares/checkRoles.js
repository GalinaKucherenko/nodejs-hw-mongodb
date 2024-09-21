import createHttpError from 'http-errors';

import { ContactsCollection } from '../db/models/contact.js';
import { ROLES } from '../constants/index.js';

export const checkRoles =
  (...roles) =>
  async (req, res, next) => {
    const { user } = req;

    // Перевіряємо, чи користувач авторизований
    if (!user) {
      return next(createHttpError(401)); // Неавторизований
    }

    const { role } = user;

    // Перевіряємо, чи роль користувача є в дозволених ролях
    if (roles.includes(role)) {
      // Для ролі USER, якщо потрібно перевірити доступ до контакту
      if (role === ROLES.USER) {
        const { contactId } = req.params;
        if (!contactId) {
          return next(createHttpError(403)); // Заборонено
        }

        const contact = await ContactsCollection.findOne({
          _id: contactId,
          userId: user._id, // Змінено на userId для узгодженості
        });

        if (!contact) {
          return next(createHttpError(403)); // Заборонено, якщо контакт не знайдено
        }
      }

      // Якщо роль дозволена, переходимо далі
      return next();
    }

    // Якщо роль не дозволена
    return next(createHttpError(403)); // Заборонено
  };
