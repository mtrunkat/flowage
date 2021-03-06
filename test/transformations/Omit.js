const { expect } = require('chai');
const ObjectStreamUtilities = require('../../src/main');
const { getReadableStream } = require('../_helper');

describe('Omit', () => {
    it('works', async () => {
        const items = [
            { foo: 'bar', x: 1, y: 'xxx' },
            { foo: 'hotel', x: 2, y: 'xxx' },
            { foo: 'restaurant', x: 3, y: 'xxx' },
            { foo: 'hotel', x: 4, y: 'xxx' },
            { foo: 'hotel', x: 5, y: 'xxx' },
        ];
        const readable = getReadableStream(items, 1);

        const data = await readable
            .pipe(new ObjectStreamUtilities())
            .omit('foo', 'y')
            .collect();

        expect(data).to.be.eql(items.map(item => ({ x: item.x })));
    });
});
