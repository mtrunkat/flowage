const _ = require('underscore');
const { expect } = require('chai');
const { Readable, Writable } = require('stream');
const { getReadableStream, sleepMillis } = require('./_helper');
const ObjectStreamUtilities = require('../src/main');

describe('ObjectStreamUtilities', () => {
    it('works', (done) => {
        const readable = new Readable({ objectMode: true });
        const mapped = readable
            .pipe(new ObjectStreamUtilities());

        const odd = mapped
            .filter(obj => obj.x % 2)
            .map(obj => Object.assign({}, obj, { is: 'odd' }));

        const even = mapped
            .filter(obj => obj.x % 2 === 0)
            .map(obj => Object.assign({}, obj, { is: 'even' }));

        const final = odd.merge(even);

        readable.push({ x: 1 });
        readable.push({ x: 2 });
        readable.push({ x: 3 });
        readable.push({ x: 4 });
        readable.push({ x: 5 });
        readable.push({ x: 6 });
        readable.push({ x: 7 });
        readable.push(null);

        const collected = [];
        final.on('data', data => collected.push(data));
        final.on('end', () => {
            expect(collected).to.be.eql([
                { x: 1, is: 'odd' },
                { x: 2, is: 'even' },
                { x: 3, is: 'odd' },
                { x: 4, is: 'even' },
                { x: 5, is: 'odd' },
                { x: 6, is: 'even' },
                { x: 7, is: 'odd' },
            ]);
            done();
        });
    });

    describe('collect()', () => {
        it('works', async () => {
            const items = [
                { foo: 'bar', x: 1 },
                { foo: 'hotel', x: 2 },
                { foo: 'restaurant', x: 3 },
                { foo: 'hotel', x: 4 },
                { foo: 'hotel', x: 5 },
            ];
            const readable = getReadableStream(items);
            const collected = await readable
                .pipe(new ObjectStreamUtilities())
                .collect();

            expect(collected).to.be.eql(items);
        });

        it('rejects on error', async () => {
            const readable = getReadableStream([
                { foo: 'bar', x: 1 },
                { foo: 'hotel', x: 2 },
                { foo: 'restaurant', x: 3 },
                { foo: 'hotel', x: 4 },
                { foo: 'hotel', x: 5 },
            ]);
            const stream = readable.pipe(new ObjectStreamUtilities());

            setTimeout(() => stream.emit('error', new Error('some-message')), 5);

            await stream
                .collect()
                .then(
                    () => { throw new Error('This should have failed!'); },
                    err => expect(err.message).to.be.eql('some-message'),
                );
        });
    });

    describe('onSeries()', () => {
        it('works', async () => {
            let current = 0;
            const readable = new Readable({
                objectMode: true,
                read() {
                    if (current >= 50) return this.destroy();
                    this.push({ index: current++ });
                },
            });

            const processed = [];
            await readable
                .pipe(new ObjectStreamUtilities())
                .onSeries(async (chunk) => {
                    await new Promise(resolve => setTimeout(resolve, 55 - chunk.index));
                    processed.push(chunk.index);
                });
            expect(processed).to.be.eql(_.range(0, 50));
        });

        it('works with concurrency > 1', async () => {
            let current = 0;

            const startedAt = Date.now();
            const readable = new Readable({
                objectMode: true,
                read() {
                    if (current >= 50) return this.destroy();
                    this.push({ index: current++ });
                },
            });

            let concurrency = 0;
            const concurrencies = [];

            const processed = [];
            await readable
                .pipe(new ObjectStreamUtilities())
                .onSeries(async (chunk) => {
                    concurrency++;
                    await new Promise(resolve => setTimeout(resolve, 55 - chunk.index));
                    processed.push(chunk.index);
                    concurrencies.push(concurrency);
                    concurrency--;
                }, { concurrency: 10 });

            // Order is wrong.
            expect(processed).to.not.be.eql(_.range(0, 50));

            // But contains all elements.
            expect(processed).to.be.have.members(_.range(0, 50));

            // It was running in parrallel.
            expect(Date.now() - startedAt).to.be.below(_.range(55, 5).reduce((sum, num) => sum + num, 0) / 5);

            // It was running at the right concurrency.
            const fortyNineTimesTen = _.range(0, 41).map(() => 10);
            expect(concurrencies).to.be.eql([...fortyNineTimesTen, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
        });
    });

    it(('should correctly cork and uncork streams (normal transformations)'), async () => {
        const items = _.range(0, 1000).map(index => ({ foo: index }));

        let readCount = 0;
        const readable = new Readable({
            objectMode: true,
            read() {
                readCount++;
                this.push(items.shift() || null);
            },
        });
        const writable = new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                callback();
            },
        });

        // Pipe stream.
        readable
            .pipe(new ObjectStreamUtilities())
            .map(item => item)
            .pipe(writable);

        // Cork it.
        writable.cork();

        // Wait 1 second.
        await sleepMillis(500);
        const currentReadCount = readCount;

        // Check that it's not reading any more.
        await sleepMillis(500);
        expect(currentReadCount).to.be.above(0);
        expect(currentReadCount).to.be.below(1001);
        expect(currentReadCount).to.be.eql(readCount);

        // Lets start reading again.
        writable.uncork();
        await new Promise((resolve) => {
            writable.on('finish', () => {
                expect(currentReadCount).to.be.below(readCount);
                expect(readCount).to.be.eql(1001);
                resolve();
            });
        });
    });
});
