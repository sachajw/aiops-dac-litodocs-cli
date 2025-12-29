import pkg from "fs-extra";
const { readFile, writeFile } = pkg;
import { join } from "path";

export async function generateConfig(projectDir, options) {
  const { baseUrl } = options;

  // Only modify if base URL is not default
  if (baseUrl && baseUrl !== "/") {
    const configPath = join(projectDir, "astro.config.mjs");
    let content = await readFile(configPath, "utf-8");

    // Add base option to defineConfig
    content = content.replace(
      "export default defineConfig({",
      `export default defineConfig({\n  base: '${baseUrl}',`
    );

    await writeFile(configPath, content, "utf-8");
  }
}
