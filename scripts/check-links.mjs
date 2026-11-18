// Revisa que cada enlace interno del sitio compilado (dist/) lleve a algo que existe: páginas, anclas
// (#título), imágenes, videos y descargas. Lo usa la CI después de `npm run build`.
// Uso: node scripts/check-links.mjs [carpeta]   (por defecto dist)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] ?? 'dist')
if (!existsSync(root)) {
  console.error(`No existe ${root}. Ejecuta antes npm run build.`)
  process.exit(1)
}

const pages = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith('.html')) pages.push(full)
  }
}
walk(root)

// Los ids de cada página, para revisar las anclas.
const ids = new Map()
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])))
  return ids.get(file)
}

// Una ruta del sitio → el archivo que la sirve (como lo hace Cloudflare con auto-trailing-slash).
const fileFor = (urlPath) => {
  const clean = decodeURIComponent(urlPath)
  const direct = path.join(root, clean)
  if (existsSync(direct) && statSync(direct).isFile()) return direct
  const index = path.join(root, clean, 'index.html')
  if (existsSync(index)) return index
  const html = path.join(root, `${clean.replace(/\/$/, '')}.html`)
  if (existsSync(html)) return html
  return undefined
}

let checked = 0
const broken = []
for (const page of pages) {
  const html = readFileSync(page, 'utf8')
  const here = '/' + path.relative(root, page).split(path.sep).join('/')
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) {
    const ref = m[1].replace(/&amp;/g, '&')
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(ref)) continue
    const [rawPath, anchor] = ref.split('#')
    const target = rawPath ? new URL(rawPath, `https://x${here}`).pathname : here
    const file = rawPath ? fileFor(target) : page
    checked++
    if (!file) broken.push(`${here} → ${ref}`)
    else if (anchor && file.endsWith('.html') && !idsOf(file).has(decodeURIComponent(anchor))) broken.push(`${here} → ${ref} (no existe el ancla)`)
  }
}

console.log(`${pages.length} páginas, ${checked} enlaces internos revisados.`)
if (broken.length) {
  console.error(`\n${broken.length} enlaces rotos:`)
  for (const b of broken.slice(0, 200)) console.error(`  ${b}`)
  process.exit(1)
}
console.log('Ningún enlace roto.')
