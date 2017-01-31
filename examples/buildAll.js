/*
  Build all examples at once
*/

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

var exampleDirs = fs.readdirSync(__dirname).filter((file) => {
  return fs.statSync(path.join(__dirname, file)).isDirectory()
});
/* NPM install first, buld each example separately */
var cmdArgs = [
  { cmd: 'npm', args: ['install'] },
  { cmd: 'webpack', args: ['index.js'] }
];

for (const dir of exampleDirs) {
  for (const cmdArg of cmdArgs) {
    // Declare opts in this scope to avoid
    // https://github.com/joyent/node/issues/9158
    const opts = {
      cwd: path.join(__dirname, dir),
      stdio: 'inherit'
    }
    let result = {}
    if (process.platform === 'win32') {
      result = spawnSync(cmdArg.cmd + '.cmd', cmdArg.args, opts)
    } else {
      result = spawnSync(cmdArg.cmd, cmdArg.args, opts)
    }
    if (result.status !== 0) {
      throw new Error('Building examples exited with non-zero');
    }
  }
}
