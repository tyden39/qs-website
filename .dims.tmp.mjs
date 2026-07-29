import sharp from 'sharp'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
const roots = process.argv.slice(2)
const files = []
function walk(p){ for(const e of readdirSync(p)){ const f=join(p,e); if(statSync(f).isDirectory()) walk(f); else if(/\.webp$/.test(e) && !/-\d+w\.webp$/.test(e)) files.push(f) } }
roots.forEach(walk)
for(const f of files.sort()){ const m = await sharp(f).metadata(); console.log(`${String(m.width).padStart(5)}x${String(m.height).padEnd(5)} ${f}`) }
