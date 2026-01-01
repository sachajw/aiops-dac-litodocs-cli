import pkg from "fs-extra";
const { readFile, writeFile } = pkg;
import { join } from "path";

export async function generateConfig(projectDir, options) {
  const {
    baseUrl,
    name,
    description,
    primaryColor,
    accentColor,
    favicon,
    logo,
  } = options;

  // Update docs-config.json with metadata and theme options
  const configPath = join(projectDir, "docs-config.json");
  let config = JSON.parse(await readFile(configPath, "utf-8"));

  // Update metadata
  if (name) {
    config.metadata = config.metadata || {};
    config.metadata.name = name;
  }

  if (description) {
    config.metadata = config.metadata || {};
    config.metadata.description = description;
  }

  // Update theme colors
  if (primaryColor || accentColor) {
    config.theme = config.theme || {};
    if (primaryColor) config.theme.primaryColor = primaryColor;
    if (accentColor) config.theme.accentColor = accentColor;
  }

  // Update branding
  if (favicon || logo) {
    config.branding = config.branding || {};
    if (favicon) config.branding.favicon = favicon;
    if (logo) config.branding.logo = config.branding.logo || {};
    if (logo) config.branding.logo.src = logo;
  }

  await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");

  // Update astro.config.mjs with base URL if needed
  if (baseUrl && baseUrl !== "/") {
    const astroConfigPath = join(projectDir, "astro.config.mjs");
    let content = await readFile(astroConfigPath, "utf-8");

    // Add base option to defineConfig
    content = content.replace(
      "export default defineConfig({",
      `export default defineConfig({\n  base: '${baseUrl}',`
    );

    await writeFile(astroConfigPath, content, "utf-8");
  }
}
