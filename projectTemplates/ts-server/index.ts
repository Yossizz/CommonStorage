//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { config as initDotEnv } from 'dotenv';
import { Probe } from '@map-colonies/mc-probe';
import { container } from 'tsyringe';
import { getApp } from './src/app';

async function main(): Promise<void> {
  initDotEnv();
  const port =
    process.env.SERVER_PORT != null ? parseInt(process.env.SERVER_PORT) : 80;
  const app = await getApp();
  const probe = container.resolve(Probe);
  await probe.start(app, port);
}

main();
