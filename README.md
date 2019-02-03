# Flowage

[![npm version](https://badge.fury.io/js/flowage.svg)](https://www.npmjs.com/package/flowage)

## Contents

<!-- toc -->

- [Motivation](#motivation)
- [Basic usage](#basic-usage)
- [Reference](#reference)
  * [merge](#merge)
  * [collect](#collect)
  * [filter](#filter)
  * [chunk](#chunk)
  * [map](#map)
  * [merge](#merge-1)
  * [omit](#omit)
  * [pick](#pick)
  * [pluck](#pluck)
  * [uniq](#uniq)
  * [weakSort](#weaksort)
  * [onSeries](#onseries)
- [Examples](#examples)
  * [Batched upload to database](#batched-upload-to-database)
  * [Weak sorting slightly unordered stream](#weak-sorting-slightly-unordered-stream)

<!-- tocstop -->

## Motivation

This package simplifies transformations and filtering of NodeJS streams. Think about it as [Underscore.js](http://underscorejs.org)
for streams. The basic use case I faced many times was a transformation of a large number of JSON objects that are finally stored in some database.
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

### merge `const mergedStream = stream1.merge(stream2)`

Returns stream containing values merged from 2 given streams.

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
