const { expect } = require('chai');
const ObjectStreamUtilities = require('../../src/main');
const { getReadableStream } = require('../_helper');

describe('Filter', () => {
    it('works', async () => {
        const readable = getReadableStream([
            { foo: 'bar', x: 1 },
            { foo: 'hotel', x: 2 },
            { foo: 'restaurant', x: 3 },
            { foo: 'hotel', x: 4 },
            { foo: 'hotel', x: 5 },
        ]);

        const data = await readable
            .pipe(new ObjectStreamUtilities())
            .filter(chunk => chunk.foo === 'hotel')
            .collect();

        expect(data).to.be.eql([
            { foo: 'hotel', x: 2 },
            { foo: 'hotel', x: 4 },
            { foo: 'hotel', x: 5 },
        ]);
    });
});
