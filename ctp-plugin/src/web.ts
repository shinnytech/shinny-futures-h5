import { WebPlugin } from '@capacitor/core';
import { CtpPluginPlugin } from './definitions';

export class CtpPluginWeb extends WebPlugin implements CtpPluginPlugin {
  constructor() {
    super({
      name: 'CtpPlugin',
      platforms: ['web'],
    });
  }

  async collect(): Promise<{ value: string }> {
    return {value : "671"};
  }
}

const CtpPlugin = new CtpPluginWeb();

export { CtpPlugin };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(CtpPlugin);
