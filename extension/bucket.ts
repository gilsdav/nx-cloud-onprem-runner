import { promisify } from 'util';
import { createReadStream, writeFile } from 'fs';
// import fetch from 'node-fetch';
import request from 'request-promise';

const writeFilePromise = promisify(writeFile);

export interface BucketOptions {
    url: string;
}

export interface BucketFile {
    name: string;
    path: string;
}

export class Bucket {

    constructor(private options: BucketOptions) { }

    get name() { return this.options.url; }

    public file(fileName: string): Promise<BucketFile> {
        return request.get({
            url: `${this.options.url}/file/${fileName}`,
            json: true
        }).then(x => x);
    }

    public getFiles(options: { prefix: string }): Promise<BucketFile[]> {
        return request.get({
            url: `${this.options.url}/files?prefix=${options.prefix}`,
            json: true
        }).then(x => x);
    }

    public async download(file: BucketFile, localDestination: string): Promise<any> {
        return request.get(`${this.options.url}/download?filePath=${file.path}`)
        .then(x => writeFilePromise(localDestination, Buffer.from(x)));
    }

    public async upload(localFilePath: string, fileName: string, directory = ''): Promise<any> {       
        return request.post({
            url: `${this.options.url}/upload`,
            formData: {
                file: createReadStream(localFilePath),
                directory: directory,
                name: fileName,
            }
        });
        
    }


}
