const _ = require('underscore');
const { expect } = require('chai');
const { Readable, Writable } = require('stream');
const ObjectStreamUtilities = require('../../src/main');
const { getReadableStream, sleepMillis } = require('../_helper');

describe('Map', () => {
    it('works', async () => {
        const items1 = [
            { index: '1-1' },
            { index: '1-2' },
            { index: '1-3' },
            { index: '1-4' },
            { index: '1-5' },
        ];
        const items2 = [
            { index: '2-1' },
            { index: '2-2' },
            { index: '2-3' },
            { index: '2-4' },
            { index: '2-5' },
        ];

        const readable1 = getReadableStream(items1);
        const readable2 = getReadableStream(items2);

        const data = await readable1
            .pipe(new ObjectStreamUtilities())
            .merge(readable2)
            .collect();

        expect(data).to.be.eql([
            { index: '1-1' },
            { index: '2-1' },
            { index: '1-2' },
            { index: '2-2' },
            { index: '1-3' },
            { index: '2-3' },
            { index: '1-4' },
            { index: '2-4' },
            { index: '1-5' },
            { index: '2-5' },
        ]);
    });

    it('should wait for slower merged stream', async () => {
        const items1 = [
            { index: '1-1' },
            { index: '1-2' },
            { index: '1-3' },
            { index: '1-4' },
            { index: '1-5' },
        ];
        const items2 = [
            { index: '2-1' },
            { index: '2-2' },
            { index: '2-3' },
            { index: '2-4' },
            { index: '2-5' },
        ];

        const readable1 = getReadableStream(items1, 1);
        const readable2 = getReadableStream(items2, 1, 100);

        const data = await readable1
            .pipe(new ObjectStreamUtilities())
            .merge(readable2)
            .collect();

        expect(data).to.be.eql([
            { index: '1-1' },
            { index: '1-2' },
            { index: '1-3' },
            { index: '1-4' },
            { index: '1-5' },
            { index: '2-1' },
            { index: '2-2' },
            { index: '2-3' },
            { index: '2-4' },
            { index: '2-5' },
        ]);
    });

    it('should wait for slower source stream', async () => {
        const items1 = [
            { index: '1-1' },
            { index: '1-2' },
            { index: '1-3' },
            { index: '1-4' },
            { index: '1-5' },
        ];
        const items2 = [
            { index: '2-1' },
            { index: '2-2' },
            { index: '2-3' },
            { index: '2-4' },
            { index: '2-5' },
        ];

        const readable1 = getReadableStream(items1, 1, 100);
        const readable2 = getReadableStream(items2, 1);

        const data = await readable1
            .pipe(new ObjectStreamUtilities())
            .merge(readable2)
            .collect();

        expect(data).to.be.eql([
            { index: '2-1' },
            { index: '2-2' },
            { index: '2-3' },
            { index: '2-4' },
            { index: '2-5' },
            { index: '1-1' },
            { index: '1-2' },
            { index: '1-3' },
            { index: '1-4' },
            { index: '1-5' },
        ]);
    });

    it('should pass cork/uncork events to both source and merged streams', async () => {
        const items1 = _.range(0, 1000).map(index => ({ index: `1-${index}` }));
        const items2 = _.range(0, 1000).map(index => ({ index: `2-${index}` }));
        const allItems = _.range(0, 1000).reduce((all, index) => {
            all.push({ index: `1-${index}` });
            all.push({ index: `2-${index}` });

            return all;
        }, []);

        let readCount1 = 0;
        const readable1 = new Readable({
            objectMode: true,
            read() {
                readCount1++;
                this.push(items1.shift() || null);
            },
        });
        let readCount2 = 0;
        const readable2 = new Readable({
            objectMode: true,
            read() {
                readCount2++;
                this.push(items2.shift() || null);
            },
        });
        const collectedData = [];
        const writable = new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                collectedData.push(chunk);
                callback();
            },
        });

        // Pipe stream.
        readable1
            .pipe(new ObjectStreamUtilities())
            .merge(readable2)
            .pipe(writable);

        // Cork it.
        writable.cork();

        // Wait 1 second.
        await sleepMillis(500);
        const currentReadCount1 = readCount1;
        const currentReadCount2 = readCount2;

        // Check that it's not reading any more.
        await sleepMillis(500);
        expect(currentReadCount1).to.be.above(0);
        expect(currentReadCount1).to.be.below(1001);
        expect(currentReadCount1).to.be.eql(readCount1);
        expect(currentReadCount2).to.be.above(0);
        expect(currentReadCount2).to.be.below(1001);
        expect(currentReadCount2).to.be.eql(readCount2);

        // Lets start reading again.
        writable.uncork();
        await new Promise((resolve, reject) => {
            writable.on('finish', () => {
                try {
                    expect(currentReadCount1).to.be.below(readCount1);
                    expect(readCount1).to.be.eql(1001);
                    expect(currentReadCount2).to.be.below(readCount2);
                    expect(readCount2).to.be.eql(1001);
                    expect(collectedData).to.have.deep.members(allItems);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
            writable.on('error', reject);
        });
    });
});
