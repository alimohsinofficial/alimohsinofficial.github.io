import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
const source = resolve(process.argv[2] || 'E:/WorkSpace/my/projects/blueprint_lib/gemini-blueprint-ui');
const dest = resolve('assets/vendor/blueprint');
const components = ['segmented', 'accordion', 'copy-button', 'theme-toggle'];
const files = ['blueprint.js', 'blueprint.css', ...components.flatMap(n => [`components/${n}/${n}.js`, `components/${n}/${n}.css`])];
for (const file of files) if (!existsSync(join(source, 'dist', file))) throw new Error(`Missing Blueprint distribution: ${file}`);
mkdirSync(dest, { recursive: true });
for (const file of files) { mkdirSync(resolve(dest, file, '..'), { recursive: true }); cpSync(join(source, 'dist', file), join(dest, file)); }
let commit = 'unversioned local distribution';
try { commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
for (const license of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) if (existsSync(join(source, license))) cpSync(join(source, license), join(dest, license));
writeFileSync(join(dest, 'snapshot.json'), JSON.stringify({ source, commit, synced: new Date().toISOString(), components }, null, 2));
console.log(`Synced Blueprint core and ${components.length} components. Run npm run build after library updates.`);
