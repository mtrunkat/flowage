const { ObjectIdentityTransform } = require('./utils');
const Map = require('./transformations/Map');
const Filter = require('./transformations/Filter');
const Pluck = require('./transformations/Pluck');
const Chunk = require('./transformations/Chunk');
const Merge = require('./transformations/Merge');
const Omit = require('./transformations/Omit');
const Pick = require('./transformations/Pick');
const Uniq = require('./transformations/Uniq');
const WeakSort = require('./transformations/WeakSort');

const METHODS = {
    map: Map,
    filter: Filter,
    pluck: Pluck,
    chunk: Chunk,
    omit: Omit,
    pick: Pick,
    uniq: Uniq,
    weakSort: WeakSort,
};

class ObjectStreamUtilities extends ObjectIdentityTransform {
    constructor() {
        super();
        for (const methodName of Object.keys(METHODS)) {
            this._registerTransformation(methodName, METHODS[methodName]);
        }
    }

    _registerTransformation(methodName, MethodClass) {
        this[methodName] = (...args) => {
            return this
                .pipe(new MethodClass(...args))
                .pipe(new ObjectStreamUtilities());
        };
    }

    merge(stream) {
        return this
            .pipe(new Merge(this, stream), { end: false })
            .pipe(new ObjectStreamUtilities());
    }

    async onSeries(func, { concurrency = 1 } = {}) {
        let processing = 0;

        return new Promise((resolve, reject) => {
            let finishOnLast = false;

            this.on('data', async (chunk) => {
                try {
                    processing++;
                    if (processing === concurrency) this.pause();
                    await func(chunk);
                    this.resume();
                    processing--;

                    if (processing === 0 && finishOnLast) {
                        setTimeout(() => {
                            if (processing === 0) resolve();
                        }, 0);
                    }
                } catch (err) {
                    this.emit('error', err);
                }
            });
            this.on('end', () => {
                if (processing === 0) resolve();
                else finishOnLast = true;
            });
            this.on('error', reject);
        });
    }

    async collect() {
        return new Promise((resolve, reject) => {
            const data = [];

            this.on('data', chunk => data.push(chunk));
            this.on('end', () => resolve(data));
            this.on('error', reject);
        });
    }
}

module.exports = ObjectStreamUtilities;
