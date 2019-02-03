const { ObjectTransform } = require('../utils');

module.exports = class Pluck extends ObjectTransform {
    constructor(property) {
        super();
        this.property = property;
    }

    _transform(chunk, encoding, callback) {
        try {
            callback(null, chunk[this.property]);
        } catch (err) {
            callback(err);
        }
    }
};
