import { copyFileSync, readFileSync } from 'fs';
import { join, basename } from 'path';

import { env, logger, semver, FlexPluginError, exit } from 'flex-dev-utils';
import {
  checkFilesExist,
  findGlobs,
  resolveRelative,
  getPaths,
  getCwd,
  checkPluginConfigurationExists,
  addCWDNodeModule,
  resolveModulePath,
  _require,
  setCwd,
  getCliPaths,
} from 'flex-dev-utils/dist/fs';

import {
  unbundledReactMismatch,
  versionMismatch,
  expectedDependencyNotFound,
  loadPluginCountError,
  typescriptNotInstalled,
} from '../prints';
import run from '../utils/run';
import { findFirstLocalPlugin, parseUserInputPlugins } from '../utils/parser';

interface Package {
  version: string;
  dependencies: Record<string, string>;
}

const extensions = ['js', 'jsx', 'ts', 'tsx'];

const PackagesToVerify = ['react', 'react-dom'];

export const FLAG_MULTI_PLUGINS = '--multi-plugins-pilot';

export const flags = [FLAG_MULTI_PLUGINS];

/**
 * Returns true if there are any .d.ts/.ts/.tsx files
 */
/* istanbul ignore next */
export const _hasTypescriptFiles = (): boolean =>
  findGlobs('**/*.(ts|tsx)', '!**/node_modules', '!**/*.d.ts').length !== 0;

/**
 * Validates the TypeScript project
 * @private
 */
export const _validateTypescriptProject = (): void => {
  if (!_hasTypescriptFiles()) {
    return;
  }

  if (!resolveModulePath('typescript')) {
    typescriptNotInstalled();
    exit(1);

    return;
  }

  if (checkFilesExist(getPaths().app.tsConfigPath)) {
    return;
  }

  logger.clearTerminal();
  env.persistTerminal();
  logger.warning('No tsconfig.json was found, creating a default one.');
  copyFileSync(getPaths().scripts.tsConfigPath, getPaths().app.tsConfigPath);
};

/**
 * Checks the version of external libraries and exists if customer is using another version
 *
 * @param flexUIPkg   the flex-ui package.json
 * @param allowSkip   whether to allow skip
 * @param allowReact  whether to allow unbundled react
 * @param name        the package to check
 * @private
 */
export const _verifyPackageVersion = (
  flexUIPkg: Package,
  allowSkip: boolean,
  allowReact: boolean,
  name: string,
): void => {
  const expectedDependency = flexUIPkg.dependencies[name];
  const supportsUnbundled = semver.satisfies(flexUIPkg.version, '>=1.19.0');
  if (!expectedDependency) {
    expectedDependencyNotFound(name);

    exit(1);
    return;
  }

  // @ts-ignore
  const requiredVersion = semver.coerce(expectedDependency).version;
  const installedPath = resolveRelative(getPaths().app.nodeModulesDir, name, 'package.json');
  const installedVersion = _require(installedPath).version;

  if (requiredVersion !== installedVersion) {
    if (allowReact) {
      if (supportsUnbundled) {
        return;
      }

      unbundledReactMismatch(flexUIPkg.version, name, installedVersion, allowSkip);
    } else {
      versionMismatch(name, installedVersion, requiredVersion, allowSkip);
    }

    if (!allowSkip) {
      exit(1);
    }
  }
};

/**
 * Checks the version of external libraries and exists if customer is using another version
 *
 * allowSkip  whether to allow skip
 * allowReact whether to allow reacts
 * @private
 */
/* istanbul ignore next */
export const _checkExternalDepsVersions = (allowSkip: boolean, allowReact: boolean): void => {
  const flexUIPkg = _require(getPaths().app.flexUIPkgPath);

  PackagesToVerify.forEach((name) => _verifyPackageVersion(flexUIPkg, allowSkip, allowReact, name));
};

/**
 * Returns the content of src/index
 * @private
 */
/* istanbul ignore next */
export const _readIndexPage = (): string => {
  const srcIndexPath = join(getCwd(), 'src', 'index');
  const match = extensions.map((ext) => `${srcIndexPath}.${ext}`).find((file) => checkFilesExist(file));
  if (match) {
    return readFileSync(match, 'utf8');
  }

  throw new FlexPluginError('No index file was found in your src directory');
};

/**
 * Checks how many plugins this single JS bundle is exporting
 * You can only have one plugin per JS bundle
 * @private
 */
export const _checkPluginCount = (): void => {
  const content = _readIndexPage();
  const match = content.match(/loadPlugin/g);
  if (!match || match.length === 0) {
    loadPluginCountError(0);

    exit(1);
    return;
  }
  if (match.length > 1) {
    loadPluginCountError(match.length);

    exit(1);
  }
};

/**
 * Attempts to set the cwd of the plugin
 * @param args  the CLI args
 * @private
 */
export const _setPluginDir = (...args: string[]): void => {
  if (!checkFilesExist(getCliPaths().pluginsJsonPath)) {
    return;
  }

  const userInputPlugins = parseUserInputPlugins(false, ...args);
  const plugin = findFirstLocalPlugin(userInputPlugins);

  if (plugin && checkFilesExist(plugin.dir)) {
    setCwd(plugin.dir);
  }
};

/**
 * Runs pre-start/build checks
 */
const preScriptCheck = async (...args: string[]): Promise<void> => {
  logger.debug('Checking Flex plugin project directory');

  addCWDNodeModule(...args);

  _setPluginDir(...args);
  const resetPluginDirectory = await checkPluginConfigurationExists(
    basename(process.cwd()),
    process.cwd(),
    args.includes(FLAG_MULTI_PLUGINS),
  );
  if (resetPluginDirectory) {
    _setPluginDir(...args);
  }
  _checkExternalDepsVersions(env.skipPreflightCheck(), env.allowUnbundledReact());
  _checkPluginCount();
  _validateTypescriptProject();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run(preScriptCheck);

// eslint-disable-next-line import/no-unused-modules
export default preScriptCheck;