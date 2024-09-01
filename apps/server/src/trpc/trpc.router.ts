import {
  INestApplication,
  Injectable,
  Controller,
  Get,
  Res,
  Param,
} from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '@server/trpc/trpc.service';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as multer from 'multer';
import { RedisService } from './redisService'; // Import RedisService
import * as archiver from 'archiver';

import * as fs from 'fs';
import { Response } from 'express';
import * as path from 'path';
// import { v4 as uuidv4 } from 'uuid'; // Import uuid to generate unique keys

@Controller('files')
export class FileController {
  constructor(private readonly redisService: RedisService) {}
  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    // fileName = 'downloaded-fil.jfif';
    const filePath = path.join(__dirname, '../..', 'uploads', fileName);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file to the client
    res.download(filePath, async (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file.');
      } else {
        await this.redisService.addFileToList('fileList', fileName);
      }
    });
  }

  @Get('download-all')
  async downloadAllFiles(@Res() res: Response) {
    const uploadsDir = path.join(__dirname, '../..', 'uploads');

    // Create a zip archive and set the appropriate headers
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Disposition', 'attachment; filename="files.zip"');
    res.setHeader('Content-Type', 'application/zip');

    // Stream the zip archive to the response
    archive.pipe(res);

    // Add each file in the uploads directory to the zip archive
    fs.readdirSync(uploadsDir).forEach((file) => {
      const filePath = path.join(uploadsDir, file);
      archive.file(filePath, { name: file });
    });

    // Finalize the archive when all files have been added
    archive.finalize();

    // Optionally log the files to Redis
    fs.readdirSync(uploadsDir).forEach(async (file) => {
      await this.redisService.addFileToList('fileList', file);
    });
  }
  // @Get('download/:key')
  // async downloadFile(@Param('key') key: string, @Res() res: Response) {
  //   try {
  //     // Fetch the list of files from Redis for the given key
  //     const fileNames = await this.redisService.getFileRecord(key);

  //     if (!fileNames || fileNames.length === 0) {
  //       return res.status(404).send('No files found for the provided key.');
  //     }

  //     // For simplicity, assuming the first file in the list is to be downloaded
  //     const fileName = fileNames[0]; // You can adjust this based on your logic
  //     const filePath = path.join(__dirname, '../..', 'uploads', fileName);

  //     res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  //     res.setHeader(
  //       'Content-Disposition',
  //       `attachment; filename="${fileName}"`,
  //     );

  //     // Stream the file to the client
  //     res.download(filePath, async (err) => {
  //       if (err) {
  //         console.error('Error downloading the file:', err);
  //         res.status(500).send('Error downloading the file.');
  //       } else {
  //         // Optionally, log this download or perform additional actions here
  //         await this.redisService.addFileToList('fileDownloadLog', fileName);
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Error occurred:', error);
  //     res.status(500).send('An error occurred while downloading the file.');
  //   }
  // }
  @Get('list/:key')
  async getFileList(@Param('key') key: string, @Res() res: Response) {
    const fileList = await this.redisService.getFileRecord(key);
    res.json({ key, fileList });
  }
}

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly redisService: RedisService,
  ) {}

  appRouter = this.trpc.router({
    hello: this.trpc.procedure
      .input(
        z.object({
          name: z.string().optional(),
        }),
      )
      .query(({ input }) => {
        const { name } = input;
        return {
          greeting: `Hello ${name ? name : `Bilbo`}`,
        };
      }),
  });

  async applyMiddleware(app: INestApplication) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname); // Preserve the original filename
      },
    });
    const upload = multer({ storage });

    // app.use(
    //   '/trpc/upload',
    //   upload.single('file'),
    //   async (req: any, res: any) => {
    //     const file = req.file;
    //     const text = req.body.text;
    //     console.log(req.file, req.files);
    //     if (file) {
    //       const uniqueKey = `upload_${uuidv4()}`;
    //       // Store the uploaded file name in Redis list
    //       await this.redisService.createFileRecord(
    //         uniqueKey,
    //         file.originalname,
    //       );

    //       res.json({ key: uniqueKey, fileName: file.originalname });
    //     } else {
    //       res.status(400).send('No file uploaded');
    //     }
    //   },
    // );

    app.use('/trpc/upload', upload.single('file'), (req: any, res: any) => {
      const file = req.file;
      const text = req.body.text;
      console.log(req.file, req.files);

      // Process the uploaded file and text as needed
      res.json({ file, text });
    });

    app.use(
      `/trpc`,
      trpcExpress.createExpressMiddleware({
        router: this.appRouter,
      }),
    );
  }
}

export type AppRouter = TrpcRouter[`appRouter`];
