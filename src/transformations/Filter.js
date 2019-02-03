const { ObjectTransform } = require('../utils');

module.exports = class Filter extends ObjectTransform {
    constructor(func) {
        super();
        this.func = func;
    }

    _transform(chunk, encoding, callback) {
        try {
            if (this.func(chunk)) callback(null, chunk);
            else callback();
        } catch (err) {
            callback(err);
        }
    }
};
