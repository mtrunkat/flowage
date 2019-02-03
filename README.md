# Flowage

[![npm version](https://badge.fury.io/js/flowage.svg)](https://www.npmjs.com/package/flowage)

## Contents

<!-- toc -->

- [Motivation](#motivation)
- [Basic usage](#basic-usage)
- [Reference](#reference)
  * [merge `stream1.merge(stream2)`](#merge-stream1mergestream2)
  * [collect `stream.collect()`](#collect-streamcollect)
  * [filter `stream.filter(function)`](#filter-streamfilterfunction)
  * [chunk `stream.chunk(length)`](#chunk-streamchunklength)
  * [map `stream.map(function)`](#map-streammapfunction)
  * [omit `stream.omit('field1', 'field2', ...)`](#omit-streamomitfield1-field2-)
  * [pick `stream.pick('field1', 'field2', ...)`](#pick-streampickfield1-field2-)
  * [pluck `stream.pluck('field');``](#pluck-streampluckfield)
  * [uniq `stream.uniq(field)`](#uniq-streamuniqfield)
  * [weakSort `stream.weakSort(sortFunction, bufferMinSize, bufferMaxSize)`](#weaksort-streamweaksortsortfunction-bufferminsize-buffermaxsize)
  * [onSeries `stream.onSeries(async function, concurrency)`](#onseries-streamonseriesasync-function-concurrency)

<!-- tocstop -->

## Motivation

This package simplifies transformations and filtering of NodeJS streams. Think about it as [Underscore.js](http://underscorejs.org)
for streams.

The basic use case I faced many times was a transformation of a large number of JSON objects that are finally stored in some database.
Transformation is the quick part but then you have to then chunk data in size allowed by your database to limit the number of queries
and control the flow of the whole stream based on how fast you are able to save the transformed data.

## Basic usage

```javascript
const { Readable } = require('stream');
const Flowage =  require('flowage');

// Let's have some stream that will output a series of objects { n: 0 }, { n: 1 }, { n: 2 }, { n: 3 }, ...
const readable = new Readable({ objectMode: true });
let n = 0;
setInterval(() => readable.push({ n: n++ }), 1000);

// Pipe it thru Flowage() to get stream extended by helper methods.
const flowage = readable.pipe(new Flowage());

// Split the stream into a stream of odd objects and even objects and extend them with some field is='odd' or is='even'.
const oddStream = flowage
    .filter(obj => obj.n % 2)
    .map(obj => Object.assign({}, obj, { is: 'odd' }));

const evenStream = flowage
    .filter(obj => obj.n % 2 === 0)
    .map(obj => Object.assign({}, obj, { is: 'even' }));

// Then merge them back.
const mergedStream = oddStream.merge(evenStream);

// Chunk them by 100 records.
const chunkedStream = mergedStream.chunk(100);

// Save them to MongoDB in batches of 100 items with concurrency 2.
// This also corks the stream everytime the period when max concurrency is reached.
chunkedStream.onSeries(async (arrayOf100Items) => {
    await datase.collection('test').insert(arrayOf100Items);
}, { concurrency: 2 });

```

## Reference

### merge `stream1.merge(stream2)`

Returns stream containing values merged from 2 given streams. Merged stream ends when both streams ends.

```javascript
const mergedStream = stream1.merge(stream2);
```

### collect `stream.collect()`

Returns Promise that gets resolved when stream ends to an array of all the values.

```javascript
const data = await stream.collect();
```

### filter `stream.filter(function)`

Returns stream containing filtered values.

```javascript
// Filter out even items from stream.
const filteredStream = stream.filter(val => val.index % 2 === 0);
```

### chunk `stream.chunk(length)`

Returns stream where each item is an array given number of items from original stream.

```javascript
// Chunk values into arrays of 10 items.
const chunkedStream = stream.chunk(10);
```

### map `stream.map(function)`

Returns stream where original items are transformed using given function.

```javascript
// Extend each object in the stream with `.foo = 'bar'` field.
const mappedStream = stream.map(val => Object.assign({}, val, { foo: 'bar' }));
```

### omit `stream.omit('field1', 'field2', ...)`

Returns stream where given fields where omitted.

```javascript
// Omit field1 and field2 from stream objects.
const resultingStream = stream.omit('field1', 'field2');
```

### pick `stream.pick('field1', 'field2', ...)`

Returns stream where each item contains only the given fields.

```javascript
// Pick only field1 and field2 from stream objects.
const resultingStream = stream.pick('field1', 'field2');
```

### pluck `stream.pluck('field');``

Returns stream with given field picked from each item.

```javascript
// Pick only field1 and field2 from stream objects.
const resultingStream = stream.pluck('field1');
```

### uniq `stream.uniq(field)`

Returns stream containing only unique items based on given field.
You need enough memory to keep a set of all unique values hashed using sha256.

```javascript
// Filter unique items based on id field.
const uniquesStream = stream.uniq('id');
```

### weakSort `stream.weakSort(sortFunction, bufferMinSize, bufferMaxSize)`

Returns stream containing values sorted using given function and floating buffer of a given size.

This method is helpful when only a few neighboring items may have the wrong order. This may happen
for example when a client is pushing data into the storage via API with concurrency higher than 1 and the
quests reach the server in the wrong order. Or the API has multiple redundant instances that may process
the incoming requests with different speed.

This method uses a buffer for streamed items. Every time the buffer reaches `bufferMaxSize` gets
sorted and `bufferMaxSize - bufferMinSize` items are outputted to the stream.

```javascript
const sortFunction = (a, b) => a.index < b.index ? -1 : 1;
const sortedStream = stream.sort(sortFunction, 75, 100);
```

### onSeries `stream.onSeries(async function, concurrency)`

Returns a promise that gets resolved when given function gets finished for the last item of the stream.

Everytime the given concurrency is reached it pauses the stream.

```javascript
// Store items in MongoDB with concurrency 10.
await stream.onSeries(async (item) => {
    await database.collection('items').insert(item);
}, 10);
```
