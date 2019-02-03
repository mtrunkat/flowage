const { expect } = require('chai');
const _ = require('underscore');
const ObjectStreamUtilities = require('../../src/main');
const { getReadableStream } = require('../_helper');

describe('Uniq', () => {
    it('works', async () => {
        const items = [
            { foo: 1, x: 0 },
            { foo: 1, x: 1 },
            { foo: 'a', x: 2 },
            { foo: 'b', x: 3 },
            { foo: 'ab', x: 4 },
            { foo: 'a', x: 5 },
            { foo: null, x: 6 },
            { foo: null, x: 7 },
            { foo: undefined, x: 8 },
            { x: 9 },
            { foo: '', x: 10 },
        ];
        const readable = getReadableStream(items, 1);

        const data = await readable
            .pipe(new ObjectStreamUtilities())
            .uniq('foo')
            .collect();

        expect(_.pluck(data, 'x')).to.be.eql([0, 2, 3, 4, 6]);
    });
});
