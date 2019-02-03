const { ObjectTransform } = require('../utils');

module.exports = class Chunk extends ObjectTransform {
    constructor(size) {
        super();
        this.size = size;
        this.buffer = [];
    }

    _final(callback) {
        this._emitBuffer();
        callback();
    }

    _emitBuffer() {
        this.push(this.buffer);
        this.buffer = [];
    }

    _transform(chunk, encoding, callback) {
        try {
            this.buffer.push(chunk);
            if (this.buffer.length === this.size) this._emitBuffer();
            callback();
        } catch (err) {
            callback(err);
        }
    }
};
