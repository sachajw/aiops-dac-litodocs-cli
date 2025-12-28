import { runBinary } from './package-manager.js';

export async function runAstroBuild(projectDir) {
  await runBinary(projectDir, 'astro', ['build']);
}

export async function runAstroDev(projectDir, port = '4321') {
  await runBinary(projectDir, 'astro', ['dev', '--port', port]);
}
