const { expect } = require('chai');
const ObjectStreamUtilities = require('../../src/main');
const { getReadableStream } = require('../_helper');

describe('Map', () => {
    it('works', async () => {
        const items = [
            { foo: 'bar', x: 1 },
            { foo: 'hotel', x: 2 },
            { foo: 'restaurant', x: 3 },
            { foo: 'hotel', x: 4 },
            { foo: 'hotel', x: 5 },
        ];
        const readable = getReadableStream(items, 1);
        const mapFunc = chunk => Object.assign({}, chunk, { foo: 'bar' });

        const data = await readable
            .pipe(new ObjectStreamUtilities())
            .map(mapFunc)
            .collect();

        expect(data).to.be.eql(items.map(mapFunc));
        expect(data).to.have.lengthOf(5);
    });
});
