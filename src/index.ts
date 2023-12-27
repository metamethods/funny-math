import { glob } from 'glob';
import { readFile } from 'fs/promises';

import express from 'express';
import dotenv from 'dotenv';
import toml from 'toml';

import { render } from './render';

import type { Request, Response } from 'express';

const currentDirectory = process.cwd();

let equationSets: Record<string, EquationSet> = {};

export interface Information {
  name: string;
  description: string;
  author: string;
  title: string;
}

export interface Equation {
  latex: string;
  todo?: string; // Basically like if it was a question about solving x, it'll say solve for x
}

export interface EquationSet {
  information: Information;
  equations: Equation[];
}

function handleTwitterEmbed(response: Response, slug: string) {
  response.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="og:title" content="Funny Math" />
      <meta property="og:description" content="A funny math equation" />
      <meta property="og:image" content="https://funny-math-production.up.railway.app/${slug}" />
    </head>
    <body><p>not supposed to see this buddy</p></body>
  </html>
  `);
}

async function index(_: Request, response: Response) {
  const equations = [];

  for (const equation of Object.values(equationSets)) {
    equations.push(
      `${equation.information.title}<br><a href="/${equation.information.name}">${equation.information.name} - ${equation.information.description}</a><br>made by ${equation.information.author}`,
    );
  }

  response.send(equations.join('<br><br>'));
}

async function handleEquationSlug(request: Request, response: Response) {
  const slug = request.params.equation;
  const equationSet = equationSets[slug];

  if (!equationSet) return response.status(404).send('Set not found');

  const randomEquation =
    equationSet.equations[
      Math.floor(Math.random() * equationSet.equations.length)
    ];

  const imageBuffer = await render(equationSet.information, randomEquation);

  if (request.headers['user-agent']?.includes('Twitterbot/1.0'))
    return handleTwitterEmbed(response, slug);

  response.setHeader('Content-Type', 'image/png');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');
  response.setHeader('Last-Modified', new Date().toUTCString());
  response.setHeader('Content-Length', imageBuffer.length);
  response.send(imageBuffer);
}

async function fetchSets(): Promise<Record<string, EquationSet>> {
  const files = await glob.glob(currentDirectory + '/sets/*.toml', {
    absolute: true,
  });
  const sets: Record<string, EquationSet> = {};

  for (const file of files) {
    const data = await readFile(file, 'utf-8');
    const parsed: EquationSet = toml.parse(data);
    const name = parsed.information.name;

    sets[name] = parsed;
  }

  return sets;
}

async function bootstrap() {
  const app = express();

  dotenv.config();
  equationSets = await fetchSets();

  app.get('/', index);
  app.get('/:equation', handleEquationSlug);
  app.listen(process.env.PORT);

  console.log(`Listening on port ${process.env.PORT}`);
}

bootstrap();
