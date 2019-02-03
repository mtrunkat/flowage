const { expect } = require('chai');
const ObjectStreamUtilities = require('../../src/main');
const { getReadableStream } = require('../_helper');

describe('Pick', () => {
    it('works', async () => {
        const items = [
            { foo: 'bar', x: 1, y: { something: 'else', x: 1 } },
            { foo: 'hotel', x: 2, y: { something: 'else', x: 2 } },
            { foo: 'restaurant', x: 3, y: { something: 'else', x: 3 } },
            { foo: 'hotel', x: 4, y: { something: 'else', x: 4 } },
            { foo: 'hotel', x: 5, y: { something: 'else', x: 5 } },
        ];
        const readable = getReadableStream(items, 1);

        const data = await readable
            .pipe(new ObjectStreamUtilities())
            .pluck('y')
            .collect();

        expect(data).to.be.eql(items.map(item => item.y));
    });
});
