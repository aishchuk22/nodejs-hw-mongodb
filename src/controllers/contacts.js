import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortOrder, sortBy } = parseSortParams(req.query);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    userId: req.user.id,
  });

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  if (contact.userId.toString() !== req.user.id.toString()) {
    throw createHttpError(403, 'Forbidden');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const contact = await createContact({
    ...req.body,
    userId: req.user.id,
  });

  res.status(201).json({
    status: 201,
    message: `Successfully created a contact!`,
    data: contact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;

  const contact = await deleteContact(contactId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  if (contact.userId.toString() !== req.user.id.toString()) {
    throw createHttpError(403, 'Forbidden');
  }

  res.status(204).send();
};

export const upsertContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  const result = await updateContact(contactId, req.body, {
    upsert: true,
  });

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  if (contact.userId.toString() !== req.user.id.toString()) {
    throw createHttpError(403, 'Forbidden');
  }

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully upserted a contact!`,
    data: result.contact,
  });
};

export const patchContactController = async (req, res) => {
  const { contactId } = req.params;
  const result = await updateContact(contactId, req.body);
  const contact = await getContactById(contactId);

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  if (contact.userId.toString() !== req.user.id.toString()) {
    throw createHttpError(403, 'Forbidden');
  }

  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: result.contact,
  });
};
