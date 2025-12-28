import pkg from 'fs-extra';
const { copy, ensureDir } = pkg;
import { join } from 'path';

export async function copyOutput(projectDir, outputPath) {
  const distPath = join(projectDir, 'dist');
  
  // Ensure output directory exists
  await ensureDir(outputPath);
  
  // Copy built files to output
  await copy(distPath, outputPath, {
    overwrite: true,
  });
}
