import { Controller, Get, Post, UploadedFile, UseInterceptors, Param, Body, Query, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { map, catchError } from 'rxjs/operators';
// import { BucketFile } from '@myorg/nx-cloud-onprem-client';

import { AppService } from './app.service';
import { of } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('file/:name')
  getFile(@Param('name') name: string) {
    return this.appService.checkFile(name);
  }

  @Get('files')
  getFiles(@Query('prefix') prefix: string) {
    return this.appService.checkFiles(prefix);
  }

  @Get('download')
  async download(@Query('filePath') filePath: string, @Res() response) {
    return this.appService.getFile(filePath)
      .pipe(
        map(file => file.pipe(response)),
        catchError(() => {
          throw new NotFoundException();
        })
      );
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file, @Body('directory') directory: string, @Body('name') name: string) {
      return this.appService.saveFile(file.buffer, directory, name);
  }
}
