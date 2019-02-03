const { ObjectIdentityTransform } = require('../utils');

module.exports = class Pluck extends ObjectIdentityTransform {
    constructor(sourceStream, mergedStream) {
        super();

        const sourceStreamEndPromise = new Promise((resolve => sourceStream.on('end', resolve)));
        const mergedStreamEndPromise = new Promise((resolve => mergedStream.on('end', resolve)));

        mergedStream.pipe(this, { end: false });

        Promise
            .all([
                sourceStreamEndPromise,
                mergedStreamEndPromise,
            ])
            .then(() => this.end());
    }
};
