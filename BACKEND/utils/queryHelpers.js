import mongoose from "mongoose";

export const compactUndefined = (fields) => {
  let cleanedObject = {};
  
  for (let key in fields) {
    if (fields[key] !== undefined) {
      cleanedObject[key] = fields[key];
    }
  }
  
  return cleanedObject;
};

export const buildSetUpdate = (fields) => {
  return {
    $set: compactUndefined(fields)
  };
};

export const hasSetFields = (update) => {
  if (update.$set) {
    let keyCount = Object.keys(update.$set).length;
    if (keyCount > 0) {
      return true;
    }
  }
  
  return false;
};

export const isDuplicateKeyError = (error) => {
  if (error && error.code === 11000) {
    return true;
  }
  
  return false;
};

export const normalizeEmail = (email) => {
  if (email) {
    return email.trim().toLowerCase();
  }
  
  return "";
};

export const toObjectId = (value) => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }
  
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }
  
  return new mongoose.Types.ObjectId(value);
};

export const notFoundObjectId = () => {
  return new mongoose.Types.ObjectId("000000000000000000000000");
};