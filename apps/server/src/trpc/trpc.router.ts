import {
  INestApplication,
  Injectable,
  Controller,
  Get,
  Res,
} from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '@server/trpc/trpc.service';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as multer from 'multer';
import * as fs from 'fs';
import { Response } from 'express';
import * as path from 'path';

@Controller('files')
export class FileController {
  @Get('download')
  downloadFile(@Res() res: Response) {
    const fileName = 'lv5xShBIDPe7m4ufdlV0IAc7Avk.jpg';
    const filePath = path.join(__dirname, '../..', 'uploads', fileName);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file to the client
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file.');
      }
    });
    // res.json({ name: 'sodkasodkh' });
  }
}

@Injectable()
export class TrpcRouter {
  constructor(private readonly trpc: TrpcService) {}

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
