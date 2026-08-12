import { db } from '../config/firebaseAdmin.js';

const modelRegistry = {};

const getValueByPath = (obj, path) => {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((current, part) => {
    if (current == null) return undefined;
    return current[part];
  }, obj);
};

const setValueByPath = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[lastKey] = value;
};

const isOperatorObject = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value).some((key) => key.startsWith('$'));
  }
  return false;
};

const matchCondition = (value, condition) => {
  if (condition == null || typeof condition !== 'object' || condition instanceof RegExp || Array.isArray(condition)) {
    return value === condition;
  }

  if (!isOperatorObject(condition)) {
    if (typeof value !== 'object' || value == null) {
      return false;
    }
    return Object.entries(condition).every(([key, subCondition]) =>
      matchCondition(value[key], subCondition)
    );
  }

  for (const [operator, expected] of Object.entries(condition)) {
    switch (operator) {
      case '$regex': {
        if (typeof value !== 'string') return false;
        const flags = condition.$options || 'i';
        const regex = new RegExp(expected, flags);
        if (!regex.test(value)) return false;
        break;
      }
      case '$options':
        break;
      case '$gte':
        if (typeof value !== 'number' || value < expected) return false;
        break;
      case '$lte':
        if (typeof value !== 'number' || value > expected) return false;
        break;
      case '$gt':
        if (typeof value !== 'number' || value <= expected) return false;
        break;
      case '$lt':
        if (typeof value !== 'number' || value >= expected) return false;
        break;
      case '$in':
        if (!Array.isArray(expected) || !expected.includes(value)) return false;
        break;
      default:
        return false;
    }
  }
  return true;
};

const matchQuery = (doc, query) => {
  if (!query || Object.keys(query).length === 0) {
    return true;
  }

  return Object.entries(query).every(([key, condition]) => {
    if (key === '$and') {
      if (!Array.isArray(condition)) return false;
      return condition.every((subQuery) => matchQuery(doc, subQuery));
    }
    if (key === '$or') {
      if (!Array.isArray(condition)) return false;
      return condition.some((subQuery) => matchQuery(doc, subQuery));
    }
    const value = getValueByPath(doc, key);
    return matchCondition(value, condition);
  });
};

const applySorting = (docs, sortObj) => {
  const sortKeys = Object.entries(sortObj || {});
  if (sortKeys.length === 0) return docs;

  return docs.sort((a, b) => {
    for (const [field, direction] of sortKeys) {
      let aValue = getValueByPath(a, field);
      let bValue = getValueByPath(b, field);

      // Unified pricing sorting
      if (field.startsWith('pricing.')) {
        const getPriceValue = (doc) => {
          if (!doc || !doc.pricing) return undefined;
          const { perPlate, flatRate, base, buffet } = doc.pricing;
          if (typeof perPlate === 'number') return perPlate;
          if (typeof flatRate === 'number') return flatRate;
          if (typeof base === 'number') return base;
          if (typeof buffet === 'number') return buffet;
          return undefined;
        };
        aValue = getPriceValue(a);
        bValue = getPriceValue(b);
      }

      // Unified capacity sorting
      if (field.startsWith('capacity.')) {
        const getCapacityValue = (doc) => {
          if (!doc) return undefined;
          if (typeof doc.capacity === 'object' && doc.capacity !== null) {
            return typeof doc.capacity.max === 'number' ? doc.capacity.max : undefined;
          }
          if (typeof doc.capacity === 'number') {
            return doc.capacity;
          }
          return undefined;
        };
        aValue = getCapacityValue(a);
        bValue = getCapacityValue(b);
      }

      if (aValue === bValue) continue;
      if (aValue === undefined || aValue === null) return 1 * direction;
      if (bValue === undefined || bValue === null) return -1 * direction;
      if (aValue > bValue) return direction === -1 ? -1 : 1;
      if (aValue < bValue) return direction === -1 ? 1 : -1;
    }
    return 0;
  });
};

const applySelection = (item, selectString) => {
  if (!selectString) return item;
  const fields = selectString.split(/\s+/).filter(Boolean);
  
  const cleanFields = [];
  const excludeFields = [];
  const includeAdditions = [];

  fields.forEach((f) => {
    if (f.startsWith('-')) {
      excludeFields.push(f.slice(1));
    } else if (f.startsWith('+')) {
      includeAdditions.push(f.slice(1));
    } else {
      cleanFields.push(f);
    }
  });

  // If we have clean inclusive fields (e.g., "name email")
  if (cleanFields.length > 0) {
    const selected = { id: item.id, _id: item.id };
    cleanFields.forEach((field) => {
      selected[field] = item[field];
    });
    // Add any '+' fields
    includeAdditions.forEach((field) => {
      selected[field] = item[field];
    });
    return selected;
  }

  // If we have exclusive fields (e.g., "-password")
  if (excludeFields.length > 0) {
    const copy = { ...item };
    excludeFields.forEach((field) => {
      delete copy[field];
    });
    return copy;
  }

  // If we only have '+' fields (e.g., "+passwordHash")
  if (includeAdditions.length > 0) {
    const copy = { ...item };
    includeAdditions.forEach((field) => {
      copy[field] = item[field];
    });
    return copy;
  }

  return item;
};

const getPopulationCollection = (path) => {
  const mapping = {
    organizer: 'users',
    venue: 'venues',
    user: 'users',
    reviews: 'reviews',
    customer: 'users',
    favorites: 'venues',
  };
  return mapping[path] || null;
};

class QueryBuilder {
  constructor(model, query = {}) {
    this.model = model;
    this.query = query;
    this.options = {
      limit: null,
      skip: null,
      sort: null,
      select: null,
      lean: false,
      populates: [],
      findOne: false,
    };
  }

  limit(limit) {
    this.options.limit = Number(limit);
    return this;
  }

  skip(skip) {
    this.options.skip = Number(skip);
    return this;
  }

  sort(sortObj) {
    this.options.sort = sortObj;
    return this;
  }

  select(selectStr) {
    this.options.select = selectStr;
    return this;
  }

  lean() {
    this.options.lean = true;
    return this;
  }

  populate(path, fields) {
    this.options.populates.push({ path, fields });
    return this;
  }

  async exec() {
    let queryRef = this.model.collection();

    // Safely push down simple exact-match queries to the database level
    if (this.query && typeof this.query === 'object') {
      for (const [key, value] of Object.entries(this.query)) {
        if (key.startsWith('$')) continue; // Skip operator queries like $and, $or
        if (key === 'id' || key === '_id') continue; // Skip ID filters to match via document ref or fallback

        // Only push down primitive values (strings, numbers, booleans, null)
        if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
          queryRef = queryRef.where(key, '==', value);
        }
      }
    }

    const snapshot = await queryRef.get();
    let docs = snapshot.docs.map((doc) => this.model.buildDoc(doc));
    docs = docs.filter((doc) => matchQuery(doc.toObject(true), this.query));

    if (this.options.sort) {
      docs = applySorting(docs, this.options.sort);
    }
    if (this.options.skip) {
      docs = docs.slice(this.options.skip);
    }
    if (this.options.limit != null) {
      docs = docs.slice(0, this.options.limit);
    }

    for (const populateOption of this.options.populates) {
      for (let index = 0; index < docs.length; index += 1) {
        docs[index] = await this.model.populateField(docs[index], populateOption.path, populateOption.fields);
      }
    }

    if (this.options.select) {
      docs = docs.map((doc) => {
        const selected = applySelection(doc, this.options.select);
        if (this.options.lean) {
          return selected;
        }
        if (selected.id !== undefined && typeof selected === 'object') {
          const instance = this.model.buildFromObject(selected);
          return instance;
        }
        return selected;
      });
    }

    if (this.options.lean) {
      docs = docs.map((doc) => (doc && typeof doc.toObject === 'function' ? doc.toObject(true) : doc));
    }

    if (this.options.findOne) {
      return docs[0] || null;
    }

    return docs;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

class FirestoreModel {
  constructor(data = {}) {
    const documentId = data.id || data._id;
    if (documentId) {
      Object.defineProperty(this, 'id', {
        value: documentId,
        enumerable: true,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(this, '_id', {
        value: documentId,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'id' || key === '_id') return;
      if (key === 'passwordHash') {
        Object.defineProperty(this, 'passwordHash', {
          value,
          enumerable: false,
          writable: true,
          configurable: true,
        });
      } else {
        this[key] = value;
      }
    });
  }

  static registerModel(name, Model) {
    modelRegistry[name] = Model;
  }

  static resolveModel(name) {
    return modelRegistry[name];
  }

  static collection() {
    return db.collection(this.collectionName);
  }

  static buildDoc(docSnap) {
    return new this({ id: docSnap.id, ...docSnap.data() });
  }

  static buildFromObject(data) {
    return new this(data);
  }

  static getPopulateCollection(path) {
    return getPopulationCollection(path);
  }

  static async populateField(instance, path, fields) {
    const collectionName = this.getPopulateCollection(path);
    if (!collectionName) {
      return instance;
    }

    const TargetModel = this.resolveModel(collectionName);
    if (!TargetModel) {
      return instance;
    }

    const value = instance[path];
    if (Array.isArray(value) && value.length > 0) {
      const populated = await Promise.all(value.map((id) => TargetModel.findById(id)));
      instance[path] = populated.map((item) => (item ? item.toObject(true) : null));
      if (fields) {
        instance[path] = instance[path].map((item) => applySelection(item, fields));
      }
      return instance;
    }

    if (path === 'reviews' && (!value || (Array.isArray(value) && value.length === 0))) {
      const ReviewModel = this.resolveModel('reviews');
      if (ReviewModel && instance.id) {
        const reviews = await ReviewModel.find({ venue: instance.id }).lean().exec();
        instance[path] = reviews;
        return instance;
      }
    }

    if (value != null && typeof value === 'string') {
      const populated = await TargetModel.findById(value);
      instance[path] = populated ? populated.toObject(true) : null;
      if (fields && instance[path]) {
        instance[path] = applySelection(instance[path], fields);
      }
    }

    return instance;
  }

  async populate(path, fields) {
    const modelConstructor = this.constructor;
    return modelConstructor.populateField(this, path, fields);
  }

  static find(query = {}) {
    return new QueryBuilder(this, query);
  }

  static findOne(query = {}) {
    const q = new QueryBuilder(this, query);
    q.options.findOne = true;
    q.limit(1);
    return q;
  }

  static async findById(id) {
    const snapshot = await this.collection().doc(id).get();
    if (!snapshot.exists) {
      return null;
    }
    return this.buildDoc(snapshot);
  }

  static async findByIdAndUpdate(id, update = {}, options = {}) {
    const document = await this.findById(id);
    if (!document) return null;
    const existing = document.toObject(true);
    const updated = applyUpdateToDocument(existing, update);
    await this.collection().doc(id).set(updated, { merge: true });
    const updatedDoc = await this.findById(id);
    if (options.new) return updatedDoc;
    return document;
  }

  static async findByIdAndDelete(id) {
    const document = await this.findById(id);
    if (!document) return null;
    await this.collection().doc(id).delete();
    return document;
  }

  static async countDocuments(query = {}) {
    const results = await new QueryBuilder(this, query).exec();
    return results.length;
  }

  static async insertMany(items = []) {
    const created = [];
    for (const item of items) {
      const instance = new this(item);
      await instance.save();
      created.push(instance);
    }
    return created;
  }

  async save() {
    const data = this.toObject(true);
    if (this.id) {
      await this.constructor.collection().doc(this.id).set(data, { merge: true });
    } else {
      const ref = await this.constructor.collection().add(data);
      this.id = ref.id;
      this._id = ref.id;
    }
    return this;
  }

  toObject(includeSensitive = false) {
    const result = {};
    if (this.id) {
      result.id = this.id;
      result._id = this.id;
    }
    for (const key of Object.keys(this)) {
      if (key === 'id' || key === '_id') continue;
      if (this[key] !== undefined) {
        result[key] = this[key];
      }
    }
    if (includeSensitive && Object.prototype.hasOwnProperty.call(this, 'passwordHash')) {
      result.passwordHash = this.passwordHash;
    }
    return result;
  }

  toJSON() {
    return this.toObject(false);
  }
}

const applyUpdateToDocument = (doc, update) => {
  const next = { ...doc };

  if (update.$set && typeof update.$set === 'object') {
    Object.entries(update.$set).forEach(([key, value]) => {
      setValueByPath(next, key, value);
    });
  }

  if (update.$push && typeof update.$push === 'object') {
    Object.entries(update.$push).forEach(([key, value]) => {
      const existing = getValueByPath(next, key);
      const arr = Array.isArray(existing) ? [...existing] : [];
      arr.push(value);
      setValueByPath(next, key, arr);
    });
  }

  if (update.$pull && typeof update.$pull === 'object') {
    Object.entries(update.$pull).forEach(([key, value]) => {
      const existing = getValueByPath(next, key);
      if (Array.isArray(existing)) {
        const filtered = existing.filter((item) => item !== value);
        setValueByPath(next, key, filtered);
      }
    });
  }

  if (!Object.keys(update).some((key) => key.startsWith('$'))) {
    Object.entries(update).forEach(([key, value]) => {
      next[key] = value;
    });
  }

  return next;
};

FirestoreModel.modelRegistry = modelRegistry;

export default FirestoreModel;
