const { Transform } = require('stream');

exports.ObjectTransform = class ObjectTransform extends Transform {
    constructor() {
        super({ objectMode: true });
    }
};

exports.ObjectIdentityTransform = class ObjectIdentityTransform extends exports.ObjectTransform {
    // eslint-disable-next-line
    _transform(chunk, encoding, callback) {
        callback(null, chunk);
    }
};
