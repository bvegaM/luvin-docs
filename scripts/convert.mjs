// Convierte lo capturado por scripts/capture.mjs en lo que usa el sitio:
// PNG → WebP (1600 px de ancho) y WebM → MP4 (H.264) con su póster.
// Uso: node scripts/convert.mjs <carpeta capturada> <carpeta destino (public/media/<idioma>)>
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'
import ffmpeg from 'ffmpeg-static'
import sharp from 'sharp'

const [src, dst] = process.argv.slice(2).map((p) => path.resolve(p))
mkdirSync(dst, { recursive: true })
const files = readdirSync(src)
for (const f of files.filter((x) => x.endsWith('.png') && !x.startsWith('_'))) {
  await sharp(path.join(src, f)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 84, effort: 6 }).toFile(path.join(dst, f.replace(/\.png$/, '.webp')))
}
for (const f of files.filter((x) => x.endsWith('.webm'))) {
  const name = f.replace(/\.webm$/, '')
  // `skip`: los segundos del principio que son preparación (crear el workspace, abrir el ejemplo).
  const { skip } = JSON.parse(readFileSync(path.join(src, `${name}.json`), 'utf8'))
  const out = path.join(dst, `${name}.mp4`)
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', skip.toFixed(2), '-i', path.join(src, f), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-movflags', '+faststart', '-an', out])
  // El póster es el final del video, donde ya se ve de qué trata. Si hay una captura con el
  // mismo nombre (list-pick), esa es el póster y no se pisa.
  if (existsSync(path.join(src, `${name}.png`))) continue
  const info = (() => {
    try {
      execFileSync(ffmpeg, ['-i', out], { stdio: 'pipe' })
      return ''
    } catch (e) {
      return String(e.stderr)
    }
  })()
  const [, h, m, s] = /Duration: (\d+):(\d+):([\d.]+)/.exec(info) ?? [0, 0, 0, 4]
  // El último segundo: el resultado ya está a la vista y no queda el anillo de un clic.
  const at = Math.max(0, Number(h) * 3600 + Number(m) * 60 + Number(s) - 1)
  const png = path.join(dst, `${name}.poster.png`)
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', at.toFixed(2), '-i', out, '-frames:v', '1', png])
  await sharp(png).webp({ quality: 84, effort: 6 }).toFile(path.join(dst, `${name}.webp`))
  rmSync(png)
}
const made = readdirSync(dst)
const mb = made.reduce((n, f) => n + statSync(path.join(dst, f)).size, 0) / 1e6
console.log(`${dst}: ${made.filter((f) => f.endsWith('.webp')).length} imágenes, ${made.filter((f) => f.endsWith('.mp4')).length} videos, ${mb.toFixed(1)} MB`)
