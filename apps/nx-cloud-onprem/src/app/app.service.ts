import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { createReadStream, ReadStream, existsSync, readdirSync, WriteStream, writeFileSync, statSync } from 'fs';
import { sync as mkdirSync } from 'mkdirp';
import { join, basename } from 'path';
import { environment } from '../environments/environment';

@Injectable()
export class AppService {

  private cachePath = environment.cachePath;

  getData(): { message: string } {
    return { message: 'Welcome to nx-cloud-onprem!' };
  }

  checkFile(name: string) {
    const path = join(this.cachePath, name);
    return new Observable(observer => {
      const exist = existsSync(path);
      if (exist) {
        observer.next({
          name,
          path: name
        });
      } else {
        observer.next(null);
      }
      observer.complete();
    });
  }

  checkFiles(prefix: string) {
    const path = join(this.cachePath, prefix);
    return new Observable(observer => {
      if (existsSync(path)) {
        const files = this.getAllFiles(path, null, this.cachePath) // readdirSync(path);
        const result = files.map(file => ({
          name: basename(file),
          path: file
        }))
        observer.next(result);
      } else {
        observer.next([]);
      }
      observer.complete();
    });
  }

  getFile(filePath: string): Observable<ReadStream> {
    const path = join(this.cachePath, filePath);
    return new Observable(observer => {
      const exist = existsSync(path);
      if (exist) {
        observer.next(createReadStream(path));
      } else {
        observer.error();
      }
      observer.complete();
    });
  }

  saveFile(file, directory: string, name: string): Observable<WriteStream> {
    const path = join(this.cachePath, directory);
    const exist = existsSync(path);
    if (!exist) {
      mkdirSync(path);
    }
    return new Observable(observer => {
      try {
        writeFileSync(join(path, name), file);
        observer.next();
      } catch(e) {
        observer.error();
      }
      observer.complete();
    });
  }

  private getAllFiles(dirPath: string, arrayOfFiles?: string[], basePath = ''): string[] {
    const relativeDir = dirPath.replace(basePath, '');
    const files = readdirSync(dirPath);
   
    arrayOfFiles = arrayOfFiles || [];
   
    files.forEach((file) => {
      if (statSync(join(dirPath, file)).isDirectory()) {
        arrayOfFiles = this.getAllFiles(join(dirPath, file), arrayOfFiles, basePath);
      } else {
        arrayOfFiles.push(join(relativeDir, file));
      }
    })
   
    return arrayOfFiles;
  }

}
