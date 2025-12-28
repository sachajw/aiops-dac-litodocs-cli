import pkg from 'fs-extra';
const { writeFile } = pkg;
import { join } from 'path';

export async function generateConfig(projectDir, options) {
  // Config is now handled by the template directly.
  // We avoid overwriting it to preserve custom integrations like AutoImport and ExpressiveCode.

  /*
  const { theme, baseUrl, search } = options;

  const configContent = `import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  base: '${baseUrl}',
  site: 'https://example.com', // Update this with your actual site URL
  markdown: {
    shikiConfig: {
      theme: '${theme === 'dark' ? 'github-dark' : 'github-light'}',
    },
  },
});
`;

  const configPath = join(projectDir, 'astro.config.mjs');
  await writeFile(configPath, configContent, 'utf-8');
  */
}
