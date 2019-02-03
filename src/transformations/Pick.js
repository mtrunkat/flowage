const _ = require('underscore');
const { ObjectTransform } = require('../utils');

module.exports = class Pick extends ObjectTransform {
    constructor(...fields) {
        super();
        this.fields = fields;
    }

    _transform(chunk, encoding, callback) {
        try {
            callback(null, _.pick(chunk, ...this.fields));
        } catch (err) {
            callback(err);
        }
    }
};
