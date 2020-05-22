"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bucket = void 0;
const util_1 = require("util");
const fs_1 = require("fs");
const request_promise_1 = __importDefault(require("request-promise"));
const writeFilePromise = util_1.promisify(fs_1.writeFile);
class Bucket {
    constructor(options) {
        this.options = options;
    }
    get name() { return this.options.url; }
    file(fileName) {
        return request_promise_1.default.get({
            url: `${this.options.url}/file/${fileName}`,
            json: true
        }).then(x => x);
    }
    getFiles(options) {
        return request_promise_1.default.get({
            url: `${this.options.url}/files?prefix=${options.prefix}`,
            json: true
        }).then(x => x);
    }
    async download(file, localDestination) {
        return request_promise_1.default.get(`${this.options.url}/download?filePath=${file.path}`)
            .then(x => writeFilePromise(localDestination, Buffer.from(x)));
    }
    async upload(localFilePath, fileName, directory = '') {
        return request_promise_1.default.post({
            url: `${this.options.url}/upload`,
            formData: {
                file: fs_1.createReadStream(localFilePath),
                directory: directory,
                name: fileName,
            }
        });
    }
}
exports.Bucket = Bucket;
