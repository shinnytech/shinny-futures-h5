declare module '@capacitor/core' {
  interface PluginRegistry {
    CtpPlugin: CtpPluginPlugin;
  }
}

export interface CtpPluginPlugin {
  collect(): Promise<{ value: string }>;
}
