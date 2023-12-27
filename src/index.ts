import { latexExpressions } from './latexExpressions';

import Jimp from 'jimp';
import texsvg from 'texsvg';
import svg2img from 'svg2img';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

async function handleRequest(_: Request, response: Response) {
  const randomIndex = Math.floor(Math.random() * latexExpressions.length);
  let latexExpression = latexExpressions[randomIndex];

  latexExpression = latexExpression.replace(/\\Box/g, () => {
    return Math.floor(Math.random() * 1000).toString();
  });

  const image = new Jimp(1200, 600, 0xffffffff);
  const latexSvg = await texsvg(latexExpression);
  const latexPngBuffer = await new Promise<Buffer>((resolve, reject) => {
    svg2img(latexSvg, {
      quality: 100,
      resvg: {
        fitTo: {
          mode: 'width',
          value: 1000
        }
      }
    }, (error, buffer) => {
      if (error)
        return reject(error);
      resolve(buffer);
    });
  });
  const png = await Jimp.read(latexPngBuffer);

  image.composite(png, 100, 250);
  image.print(
    await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK),
    0, 50,
    {
      text: '99.9% of people can\'t solve this',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP
    },
    1200, 250
  );
  image.print(
    await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK),
    0, 0,
    {
      text: `Equation picked: ${randomIndex}`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    },
    1200, 10
  );

  // const response = new Response(await image.getBufferAsync(Jimp.MIME_PNG));
  // response.headers.set('Content-Type', 'image/png');
  // response.headers.set('Cache-Control', 'no-store');
  // return response;

  response.contentType('image/png');
  response.header('Cache-Control', 'no-store');
  response.send(await image.getBufferAsync(Jimp.MIME_PNG));
}

const app = express();

dotenv.config();

app.get('/', handleRequest);
app.listen(process.env.PORT);

console.log(`Listening on port ${process.env.PORT}`);