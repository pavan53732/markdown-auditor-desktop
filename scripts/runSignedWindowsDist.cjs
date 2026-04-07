const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { detectWindowsSigningMode } = require('./windowsSigningSupport.cjs');

const signing = detectWindowsSigningMode(process.env);

if (!signing.configured) {
  console.error('Signed Windows distribution requested, but no signing certificate configuration was found.');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const env = {
  ...process.env,
  WINDOWS_SIGN_FORCE: '1'
};

function run(command, args) {
  const executable = process.platform === 'win32' ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, {
    cwd: root,
    env,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run('npm', ['run', 'build']);
run('npx', ['electron-builder', '--config', 'electron-builder.config.cjs', '--win', 'portable', 'nsis']);
