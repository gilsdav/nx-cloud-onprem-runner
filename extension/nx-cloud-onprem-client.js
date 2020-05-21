"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const default_1 = __importDefault(require("@nrwl/workspace/tasks-runners/default"));
const path_1 = require("path");
const util_1 = require("util");
const fs_1 = require("fs");
const readdir = util_1.promisify(fs_1.readdir);
const stat = util_1.promisify(fs_1.stat);
const mkdirp_1 = __importDefault(require("mkdirp"));
const bucket_1 = require("./bucket");
function runner(tasks, options, context) {
    if (!options.bucket) {
        throw new Error('missing bucket property in runner options. Please update nx.json');
    }
    const bucket = new bucket_1.Bucket(options.bucket);
    return default_1.default(tasks, { ...options, remoteCache: { retrieve, store } }, context);
    async function retrieve(hash, cacheDirectory) {
        try {
            // Check if commit exists
            const commitFile = await bucket.file(`${hash}.commit`);
            if (!commitFile) {
                return false;
            }
            // Gets list of file names of this commit
            const files = await bucket.getFiles({ prefix: `${hash}/` });
            // Download all files
            await Promise.all(files.map(download));
            // Download commit file
            await download(commitFile); // commit file after we're sure all content is downloaded
            console.log(`retrieved ${files.length + 1} files from cache gs://${bucket.name}/${hash}`);
            return true;
        }
        catch (e) {
            console.log(e);
            console.log(`WARNING: failed to download cache from ${bucket.name}: ${e.message}`);
            return false;
        }
        async function download(file) {
            console.log('file.name', file.name);
            const destination = path_1.join(cacheDirectory, file.path);
            console.log('dirname', path_1.dirname(destination));
            await mkdirp_1.default(path_1.dirname(destination));
            await bucket.download(file, destination);
        }
    }
    async function store(hash, cacheDirectory) {
        const tasks = [];
        try {
            // Upload all files
            console.log('hash', hash);
            console.log('cacheDirectory', cacheDirectory);
            await uploadDirectory(path_1.join(cacheDirectory, hash));
            await Promise.all(tasks);
            // Upload commit file
            await bucket.upload(path_1.join(cacheDirectory, `${hash}.commit`), `${hash}.commit`); // commit file once we're sure all content is uploaded
            console.log(`stored ${tasks.length + 1} files in cache gs://${bucket.name}/${hash}`);
            return true;
        }
        catch (e) {
            console.log(`WARNING: failed to upload cache to ${bucket.name}: ${e.message}`);
            return false;
        }
        async function uploadDirectory(dir) {
            console.log('dir', dir);
            for (const entry of await readdir(dir)) {
                const full = path_1.join(dir, entry);
                const stats = await stat(full);
                if (stats.isDirectory()) {
                    await uploadDirectory(full);
                }
                else if (stats.isFile()) {
                    // const destination = relative(cacheDirectory, full);
                    const destination = path_1.relative(cacheDirectory, dir);
                    console.log('full', full, destination, entry);
                    tasks.push(bucket.upload(full, entry, destination));
                }
            }
        }
    }
}
exports.default = runner;
