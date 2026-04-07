const {
  buildWindowsSigningConfig
} = require('./scripts/windowsSigningSupport.cjs');

const productName = 'Markdown Intelligence Auditor';
const publisherName = process.env.WINDOWS_SIGN_PUBLISHER_NAME || 'Prem V';

module.exports = {
  appId: 'com.local.markdownauditor',
  productName,
  copyright: 'Copyright (c) 2026 Prem V',
  directories: {
    output: 'dist-electron-v4'
  },
  win: {
    ...buildWindowsSigningConfig(process.env, {
      defaultPublisherName: publisherName
    }),
    target: [
      {
        target: 'portable',
        arch: ['x64']
      },
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'build/icon.ico'
  },
  portable: {
    artifactName: 'MarkdownAuditor-portable.exe'
  },
  nsis: {
    artifactName: 'MarkdownAuditor-setup-${version}.exe',
    oneClick: false,
    perMachine: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: productName,
    deleteAppDataOnUninstall: false
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'build/**/*',
    'node_modules/**/*',
    'package.json'
  ]
};
