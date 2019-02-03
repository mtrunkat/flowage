const { ObjectTransform } = require('../utils');

module.exports = class Map extends ObjectTransform {
    constructor(func) {
        super();
        this.func = func;
    }

    _transform(chunk, encoding, callback) {
        try {
            callback(null, this.func(chunk));
        } catch (err) {
            callback(err);
        }
    }
};
