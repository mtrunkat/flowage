const { PassThrough } = require('stream');

exports.getReadableStream = (data = [], pauseMillis = 25, initialDelatMillis = 0) => {
    const readable = new PassThrough({ objectMode: true });

    data.forEach((item, index) => {
        setTimeout(() => {
            readable.push(item);
            if (index === data.length - 1) readable.push(null);
        }, initialDelatMillis + index * pauseMillis);
    });

    return readable;
};

exports.sleepMillis = (millis) => {
    return new Promise(resolve => setTimeout(resolve, millis));
};
