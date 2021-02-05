import { ListPlugins } from 'flex-plugins-api-toolkit/dist/scripts';

import { createDescription } from '../../../../utils/general';
import InformationFlexPlugin from '../../../../sub-commands/information-flex-plugin';
import { listPlugins as listPluginsDocs } from '../../../../commandDocs.json';

/**
 * Lists the Flex Plugins
 */
export default class FlexPluginsListPlugins extends InformationFlexPlugin<ListPlugins[]> {
  static description = createDescription(listPluginsDocs.description, false);

  static flags = {
    ...InformationFlexPlugin.flags,
  };

  /**
   * @override
   */
  async getResource(): Promise<ListPlugins[]> {
    const result = await this.pluginsApiToolkit.listPlugins({});

    return result.plugins;
  }

  /**
   * @override
   */
  /* istanbul ignore next */
  notFound(): void {
    this._logger.info(`!!No plugins where not found.!!`);
  }

  /**
   * @override
   */
  /* istanbul ignore next */
  print(plugins: ListPlugins[]): void {
    const activePlugins = plugins.filter((p) => p.isActive);
    const inactivePlugins = plugins.filter((p) => !p.isActive);

    this.printHeader('Active Plugins');
    activePlugins.forEach(this._print.bind(this));
    this._logger.newline();
    this.printHeader('Inactive Plugins');
    inactivePlugins.forEach(this._print.bind(this));
  }

  /* istanbul ignore next */
  private _print(plugin: ListPlugins) {
    this.printVersion(plugin.name);
    this.printPretty(plugin, 'isActive', 'name');
    this._logger.newline();
  }
}
