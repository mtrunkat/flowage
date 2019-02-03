const { expect } = require('chai');
const _ = require('underscore');
const ObjectStreamUtilities = require('../../src/main');
const { getReadableStream } = require('../_helper');

describe('Chunk', () => {
    it('works', async () => {
        const items = _.range(0, 1000).map(index => ({ index }));
        const readable = getReadableStream(items, 1);

        const data = await readable
            .pipe(new ObjectStreamUtilities())
            .chunk(248)
            .collect();

        expect(data).to.be.eql(_.chunk(items, 248));
        expect(data).to.have.lengthOf(5);
    });
});
