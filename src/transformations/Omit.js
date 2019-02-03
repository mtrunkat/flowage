const _ = require('underscore');
const { ObjectTransform } = require('../utils');

module.exports = class Omit extends ObjectTransform {
    constructor(...fields) {
        super();
        this.fields = fields;
    }

    _transform(chunk, encoding, callback) {
        try {
            callback(null, _.omit(chunk, ...this.fields));
        } catch (err) {
            callback(err);
        }
    }
};
