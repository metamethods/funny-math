import Jimp from 'jimp';
import svg2img from 'svg2img';
import texsvg from 'texsvg';

import { IMAGE_HEIGHT, IMAGE_WIDTH } from './constants';

import type { Information, Equation } from '.';

async function fitTo(
  imageBuffer: Buffer,
  width: number,
  height: number,
): Promise<Buffer> {
  const image = await Jimp.read(imageBuffer);
  const aspectRatio = image.getWidth() / image.getHeight();

  let newWidth = width;
  let newHeight = height;

  if (aspectRatio > width / height) {
    newHeight = newWidth / aspectRatio;
  } else {
    newWidth = newHeight * aspectRatio;
  }

  image.resize(newWidth, newHeight);

  return await image.getBufferAsync(Jimp.MIME_PNG);
}

export async function render(
  information: Information,
  equation: Equation,
): Promise<Buffer> {
  const image = new Jimp(IMAGE_WIDTH, IMAGE_HEIGHT, 0xffffffff);

  const latexSvgBuffer = await texsvg(
    equation.latex.replace(/\\Box/g, () =>
      Math.floor(Math.random() * 25).toString(),
    ),
  );
  const latexPngBuffer = await new Promise<Buffer>((resolve, reject) =>
    svg2img(
      latexSvgBuffer,
      {
        quality: 100,
        resvg: {
          fitTo: {
            mode: 'width',
            value: 1000,
          },
        },
      },
      (error, buffer) => {
        if (error) return reject(error);
        resolve(buffer);
      },
    ),
  );

  const latexImage = await Jimp.read(await fitTo(latexPngBuffer, 1200, 200));

  const titleFont = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  const todoFont = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const authorFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  const regularFont = await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK);

  image.composite(
    latexImage,
    (IMAGE_WIDTH - latexImage.getWidth()) / 2,
    IMAGE_HEIGHT - latexImage.getHeight() - 125,
  );

  image.print(
    titleFont,
    0,
    20,
    {
      text: information.title,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    },
    IMAGE_WIDTH,
  );

  image.print(
    todoFont,
    0,
    100,
    {
      text: equation.todo ?? '',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    },
    IMAGE_WIDTH,
  );

  image.print(
    authorFont,
    0,
    64 + 40,
    {
      text: `Set created by ${information.author}`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    },
    IMAGE_WIDTH,
  );

  image.print(
    regularFont,
    16,
    IMAGE_HEIGHT - 32,
    'Website made by metamethods | https://github.com/metamethods/funny-math',
    IMAGE_WIDTH,
  );

  return await image.getBufferAsync(Jimp.MIME_PNG);
}
