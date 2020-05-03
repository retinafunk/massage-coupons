import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'massage-gutscheine',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      copy: [
        { src: 'assets' }
      ],
      serviceWorker: null // disable service workers
    }
  ]
};
