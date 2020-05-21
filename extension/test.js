// @ts-check

// const client = require('./nx-cloud-onprem-client');
const buck = require('./bucket');

const bucket = new buck.Bucket({ url: 'http://localhost:3333/api' });

// bucket.file('test.txt')
//     .then(file => bucket.download(file, './test.commit'))
//     .then(value => console.log(value));

// bucket.getFiles({ prefix: 'bob/' })
//     .then(value => console.log(value));

// bucket.download({ name: 'hello.txt', path: 'bob/hello.txt' }, './test.commit')
//     .then(value => console.log(value));

// bucket.upload('./test.commit', 'bob/yolo')
//     .then(value => console.log(value));