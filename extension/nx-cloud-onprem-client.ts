import defaultTaskRunner from '@nrwl/workspace/tasks-runners/default';
import { join, dirname, relative } from 'path';
import { promisify } from 'util';
import { readdir as def_readdir, stat as def_stat } from 'fs';
const readdir = promisify(def_readdir);
const stat = promisify(def_stat);
import mkdirp from 'mkdirp';
import { Bucket, BucketFile, BucketOptions } from './bucket';

export default function runner(
    tasks: Parameters<typeof defaultTaskRunner>[0],
    options: Parameters<typeof defaultTaskRunner>[1] & { bucket?: BucketOptions },
    context: Parameters<typeof defaultTaskRunner>[2],
) {
    if (!options.bucket) {
        throw new Error('missing bucket property in runner options. Please update nx.json');
    }
    const bucket = new Bucket(options.bucket);
    return defaultTaskRunner(tasks, { ...options, remoteCache: { retrieve, store } }, context);

    async function retrieve(hash: string, cacheDirectory: string): Promise<boolean> {
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
        } catch (e) {
            console.log(e);
            console.log(`WARNING: failed to download cache from ${bucket.name}: ${e.message}`);
            return false;
        }

        async function download(file: BucketFile) {
            console.log('file.name', file.name);
            const destination = join(cacheDirectory, file.path);
            console.log('dirname', dirname(destination));
            await mkdirp(dirname(destination));
            await bucket.download(file, destination);
        }
    }

    async function store(hash: string, cacheDirectory: string): Promise<boolean> {
        const tasks: Promise<any>[] = [];
        try {
            // Upload all files
            console.log('hash', hash);
            console.log('cacheDirectory', cacheDirectory);
            await uploadDirectory(join(cacheDirectory, hash));
            await Promise.all(tasks);
            // Upload commit file
            await bucket.upload(join(cacheDirectory, `${hash}.commit`), `${hash}.commit`); // commit file once we're sure all content is uploaded
            console.log(`stored ${tasks.length + 1} files in cache gs://${bucket.name}/${hash}`);
            return true;
        } catch (e) {
            console.log(`WARNING: failed to upload cache to ${bucket.name}: ${e.message}`);
            return false;
        }

        async function uploadDirectory(dir: string) {
            console.log('dir', dir)
            for (const entry of await readdir(dir)) {
                const full = join(dir, entry);
                const stats = await stat(full);
                if (stats.isDirectory()) {
                    await uploadDirectory(full);
                } else if (stats.isFile()) {
                    // const destination = relative(cacheDirectory, full);
                    const destination = relative(cacheDirectory, dir);
                    console.log('full', full, destination, entry);
                    tasks.push(bucket.upload(full, entry, destination));
                }
            }
        }
    }
}