#!/usr/bin/env node

import { env, spawn, exit } from 'flex-dev-utils';
import { logger } from 'flex-dev-utils';
import { checkForUpdate } from 'flex-dev-utils/dist/updateNotifier';
import { readdirSync, existsSync } from 'fs';
import { render as markedRender } from 'flex-dev-utils/dist/marked';
import { join, dirname } from 'path';
import { Realm } from 'flex-dev-utils/dist/env';

import run from './utils/run';
import { getPaths, getCwd, addCWDNodeModule } from 'flex-dev-utils/dist/fs';

checkForUpdate();

const spawnScript = async (...argv: string[]) => {
  // Directory of this file
  const dir = dirname(__filename);

  // Get all the scripts inside /scripts directory
  // `run.js` is an exception, so filter that one out
  const files = readdirSync(join(dir, 'scripts'));
  let scripts = files
    .filter((f) => {
      const ext = f.split('.').pop();

      return ext === 'js' || ext === 'ts';
    })
    .map((f) => f.split('.')[0])
    .filter((f) => f !== 'run');
  scripts = [...new Set(scripts)];

  const scriptIndex = argv.findIndex((x) => scripts.includes(x));
  const script = scriptIndex !== -1 && argv[scriptIndex];

  if (!script) {
    const options = logger.colors.blue(scripts.join(', '));
    logger.error(`Unknown script '${script}'; please choose from one of: ${options}.`);
    return exit(1);
  }

  // Print help doc and quit
  if (argv.includes('--help') && script) {
    const docPath = join(dir, '../docs', script) + '.md';
    if (!existsSync(docPath)) {
      logger.warning(`No documentation was found for ${script}`);
      return exit(1);
    }

    markedRender(docPath);
    return exit(0);
  }

  const nodeArgs = scriptIndex > 0 ? argv.slice(0, scriptIndex) : [];
  const scriptPath = require.resolve(`./scripts/${script}`);
  const scriptArgs = argv.slice(scriptIndex + 1);
  const processArgs = nodeArgs.concat(scriptPath).concat(scriptArgs);

  // Temp disallow version while we figure this out
  if (script !== 'test' && !processArgs.includes('--pilot-plugins-api')) {
    processArgs.push('--disallow-versioning');
  }

  addCWDNodeModule(...processArgs);

  // Backwards Compatibility 'npm run start'
  if (getCwd().includes('plugin-') && !processArgs.includes(getPaths().app.name)) {
    processArgs.push('--name');
    processArgs.push(getPaths().app.name);
  }

  processArgs.push('--run-script');
  const { exitCode } = await spawn('node', processArgs);
  exit(exitCode, argv);
};

/**
 * Sets the environment variables from the argv command line
 * @param argv
 */
export const setEnvironment = (...argv: string[]) => {
  if (argv.includes('--quiet')) {
    env.setQuiet();
  }

  if (argv.includes('--persist-terminal')) {
    env.persistTerminal();
  }

  const indexRealm = argv.indexOf('--realm');
  if (indexRealm !== -1) {
    const realm = argv[indexRealm + 1];
    if (realm === 'dev' || realm === 'stage') {
      env.setRealm(realm as Realm);
    }
  }
};

export default spawnScript;
