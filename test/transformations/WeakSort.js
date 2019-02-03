const { expect } = require('chai');
const _ = require('underscore');
const ObjectStreamUtilities = require('../../src/main');
const { getReadableStream } = require('../_helper');

describe('WeakSort', () => {
    it('works', async () => {
        const items = [
            { num: 0 },
            { num: 4 },
            { num: 19 },
            { num: 5 },
            { num: 1 },
            { num: 2 },
            { num: 3 },
            { num: 6 },
            { num: 7 },
            { num: 8 },
            { num: 9 },
            { num: 10 },
            { num: 17 },
            { num: 18 },
            { num: 11 },
            { num: 12 },
            { num: 15 },
            { num: 13 },
            { num: 14 },
            { num: 16 },
            { num: 20 },
        ];
        const readable = getReadableStream(items, 1);

        const data = await readable
            .pipe(new ObjectStreamUtilities())
            .weakSort((a, b) => (a.num < b.num ? -1 : 1), 5, 9)
            .collect();

        expect(_.pluck(data, 'num')).to.be.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    });

    it('will not sort perfectly', async () => {
        const items = [
            { num: 19 },
            { num: 16 },
            { num: 20 },
            { num: 13 },
            { num: 14 },
            { num: 0 },
            { num: 4 },
            { num: 5 },
            { num: 1 },
            { num: 2 },
            { num: 3 },
            { num: 6 },
            { num: 7 },
            { num: 8 },
            { num: 9 },
            { num: 10 },
            { num: 12 },
            { num: 17 },
            { num: 18 },
            { num: 11 },
            { num: 15 },
        ];
        const readable = getReadableStream(items, 1);

        const data = await readable
            .pipe(new ObjectStreamUtilities())
            .weakSort((a, b) => (a.num < b.num ? -1 : 1), 5, 10)
            .collect();

        expect(_.pluck(data, 'num')).to.be.eql([0, 1, 2, 4, 5, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    });
});
