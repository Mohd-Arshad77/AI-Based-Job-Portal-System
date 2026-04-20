import mongoose from "mongoose";

export const compactUndefined = (fields) =>
  Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));

export const buildSetUpdate = (fields) => ({
  $set: compactUndefined(fields)
});

export const hasSetFields = (update) => Object.keys(update.$set || {}).length > 0;

export const isDuplicateKeyError = (error) => error?.code === 11000;

export const normalizeEmail = (email) => email?.trim().toLowerCase();

export const toObjectId = (value) => {
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

export const notFoundObjectId = () => new mongoose.Types.ObjectId("000000000000000000000000");
