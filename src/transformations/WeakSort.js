const { ObjectTransform } = require('../utils');

module.exports = class WeakSort extends ObjectTransform {
    constructor(sortFunction, bufferMinSize = 75, bufferMaxSize = 100) {
        super();
        this.sortFunction = sortFunction;
        this.bufferMinSize = bufferMinSize;
        this.bufferMaxSize = bufferMaxSize;
        this.buffer = [];
    }

    _final(callback) {
        this._emitBuffer(this.buffer.length);
        callback();
    }

    _emitBuffer(count) {
        this.buffer.sort(this.sortFunction);
        for (let i = 0; i < count; i++) this.push(this.buffer.shift());
    }

    _transform(chunk, encoding, callback) {
        try {
            this.buffer.push(chunk);
            if (this.buffer.length >= this.bufferMaxSize) {
                this._emitBuffer(this.bufferMaxSize - this.bufferMinSize);
            }
            callback();
        } catch (err) {
            callback(err);
        }
    }
};
