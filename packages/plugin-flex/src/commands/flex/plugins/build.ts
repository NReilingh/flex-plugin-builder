import { OutputFlags } from '@oclif/parser/lib/parse';

import { createDescription } from '../../../utils/general';
import FlexPlugin from '../../../sub-commands/flex-plugin';
import { build as buildDocs } from '../../../commandDocs.json';

const baseFlags = { ...FlexPlugin.flags };
// @ts-ignore
delete baseFlags.json;

/**
 * Builds the the plugin bundle
 */
export default class FlexPluginsBuild extends FlexPlugin {
  static description = createDescription(buildDocs.description, true);

  static flags = {
    ...FlexPlugin.flags,
  };

  /**
   * @override
   */
  async doRun(): Promise<void> {
    process.env.PERSIST_TERMINAL = 'true';
    await this.runScript('pre-script-check');
    await this.runScript('build');
  }

  /**
   * Parses the flags passed to this command
   */
  /* istanbul ignore next */
  get _flags(): OutputFlags<typeof FlexPluginsBuild.flags> {
    return this.parse(FlexPluginsBuild).flags;
  }

  /**
   * @override
   */
  get checkCompatibility(): boolean {
    return true;
  }
}
