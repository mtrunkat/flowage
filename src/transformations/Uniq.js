const crypto = require('crypto');
const { ObjectTransform } = require('../utils');

const HASHING_ALGORITHM = 'sha256';

const hash = string => crypto
    .createHash(HASHING_ALGORITHM)
    .update(string)
    .digest('base64');

const existing = {};

module.exports = class Uniq extends ObjectTransform {
    constructor(keyField) {
        super();
        this.keyField = keyField;
    }

    _transform(chunk, encoding, callback) {
        try {
            const val = chunk[this.keyField];
            const hashed = hash(val ? val.toString() : '');
            if (existing[hashed]) return callback();

            existing[hashed] = true;
            callback(null, chunk);
        } catch (err) {
            callback(err);
        }
    }
};
