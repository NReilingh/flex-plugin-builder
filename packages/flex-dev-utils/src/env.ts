import env from 'flex-plugins-utils-env';

export { Realm } from 'flex-plugins-utils-env/dist/lib/env';

export enum Environment {
  Production = 'production',
  Development = 'development',
  Test = 'test',
}

export enum Lifecycle {
  Test = 'test',
  Build = 'build',
  Prebuild = 'prebuild',
  Deploy = 'deploy',
  Predeploy = 'predeploy',
}

/**
 * Helper method to test whether env variable is defined
 * @param key the env to lookup
 * @return whether the key is set
 */
const isDefined = (key: string | undefined) => typeof key === 'string' && key !== '';

/* istanbul ignore next */
export const skipPreflightCheck = () => process.env.SKIP_PREFLIGHT_CHECK === 'true';
export const allowUnbundledReact = () => process.env.UNBUNDLED_REACT === 'true';
export const getAccountSid = () => process.env.TWILIO_ACCOUNT_SID;
export const getAuthToken = () => process.env.TWILIO_AUTH_TOKEN;
export const hasHost = () => isDefined(process.env.HOST);
export const getHost = () => process.env.HOST;
export const setHost = (host: string) => process.env.HOST = host;
export const hasPort = () => isDefined(process.env.PORT);
export const getPort = () => Number(process.env.PORT);
export const setPort = (port: number) => process.env.PORT = String(port);
export const getNodeEnv = () => process.env.NODE_ENV;
export const setNodeEnv = (_env: Environment) => process.env.NODE_ENV = _env;
export const getBabelEnv = () => process.env.BABEL_ENV;
export const setBabelEnv = (_env: Environment) => process.env.BABEL_ENV = _env;
export const getLifecycle = () => process.env.npm_lifecycle_event;
export const isLifecycle = (cycle: Lifecycle) => process.env.npm_lifecycle_event === cycle;
export const isHTTPS = () => process.env.HTTPS === 'true';
export const setWDSSocketHost = (host: string) => process.env.WDS_SOCKET_HOST = host;
export const getWDSSocketHost = () => process.env.WDS_SOCKET_HOST;
export const setWDSSocketPath = (path: string) => process.env.WDS_SOCKET_PATH = path;
export const getWDSSocketPath = () => process.env.WDS_SOCKET_PATH;
export const setWDSSocketPort = (port: number) => process.env.WDS_SOCKET_PORT = port.toString();
export const getWDSSocketPort = () => Number(process.env.WDS_SOCKET_PORT);
export const getWSSocket = () => ({
  host: process.env.WDS_SOCKET_HOST,
  path: process.env.WDS_SOCKET_PATH,
  port: process.env.WDS_SOCKET_PORT,
});

export default {
  ...env,
  skipPreflightCheck,
  allowUnbundledReact,
  getAccountSid,
  getAuthToken,
  hasHost,
  getHost,
  setHost,
  hasPort,
  getPort,
  setPort,
  getNodeEnv,
  setNodeEnv,
  getBabelEnv,
  setBabelEnv,
  getLifecycle,
  isLifecycle,
  isHTTPS,
  getWDSSocketHost,
  setWDSSocketHost,
  getWDSSocketPath,
  setWDSSocketPath,
  setWDSSocketPort,
  getWDSSocketPort,
  getWSSocket,
};
