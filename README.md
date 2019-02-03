# @TODO find name

## TOC

## Motivation

## Basic usage

```javascript
const { Readable } = require('stream');
const ObjectStreamUtilities =  require('../src/main');

// Let have some stream that will output a serie of objects { n: 0 }, { n: 1 }, { n: 2 }, { n: 3 }, ...
const readable = new Readable({ objectMode: true });
let n = 0;
setInterval(() => readable.push({ n: n++ }), 1000);

// Pipe it thru ObjectStreamUtilities() that returns stream extended
// with many methods.
const objectStream = readable.pipe(new ObjectStreamUtilities());

// Split the stream into a stream of odd objects and even objects
// and extend them with some field is=odd or is=even
const oddStream = objectStream
    .filter((obj) => obj.x % 2)
    .map((obj) => Object.assign({}, obj, { is: 'odd' }));

const evenStream = objectStream
    .filter((obj) => obj.x % 2 === 0)
    .map((obj) => Object.assign({}, obj, { is: 'even' }));

// Then merge them back.
const mergedStream = oddStream.merge(evenStream);

// Chunk them by 100 records.
const chunkedStream = mergedStream.chunk(100);

// Save them to MongoDB in batches of 100 items with concurrency 2.
// This always corks the stream during the period when max concurrency is reached.
chunkedStream.onSeries(async (arrayOf100Items) => {
    await datase.collection('test').insert(arrayOf100Items);
}, { concurrency: 2 });

```

## Reference

### merge

### collect

### filter

### chunk

### map

### merge

### omit

### pick

### pluck

### uniq

### weakSort

### onSeries

## Examples

### Batched upload to database



### Weak sorting slightly unordered stream
