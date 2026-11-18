// Ejecuta las recetas de la documentación con el motor real de Luvin, contra las APIs reales, y dice si
// cada workflow pasa. Así ningún ejemplo publicado está roto.
// Uso (desde luvin-docs):  npm run verify-recipes [nombre-de-receta…]
// Cada receta es una carpeta de public/recipes/<nombre>/ con sus contratos (*.openapi.yaml), su Arazzo
// (*.arazzo.yaml) y, si hace falta, inputs.json ({ "<workflowId>": { "<input>": valor } }) y
// expect.json ({ "<workflowId>": "success" | "failed" }; por defecto se espera "success").
// Necesita el repositorio de la app al lado (../luvin, o LUVIN_DIR=/ruta) con sus dependencias.
// Escribe una prueba temporal en la app, la ejecuta con su Vitest y la borra al terminar.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const app = path.resolve(process.env.LUVIN_DIR ?? path.join(here, '..', '..', 'luvin'))
const recipes = path.resolve(here, '..', 'public', 'recipes')
const only = process.argv.slice(2)
// Una carpeta y un reporte por ejecución: varias pueden correr a la vez sin pisarse.
const tmp = path.join(app, 'src', `__docs_verify_${process.pid}__`)
const report = path.join(here, '..', `.recipes-report.${process.pid}.json`)
const latest = path.join(here, '..', '.recipes-report.json')

const test = `
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { it } from 'vitest'
import { analyzeProject } from '../core/analyze'
import { fetchExecutor } from '../core/http'
import { buildCollection, parseFile } from '../core/loader'
import { runDependencies, runWorkflow } from '../core/runner'
import { defaultInputs } from '../core/testcases'
import { loadFaker } from '../core/dynamicVars'

const ROOT = ${JSON.stringify(recipes)}
const ONLY = ${JSON.stringify(only)}
it('recetas', async () => {
  // Como la app antes de ejecutar: los generadores ({{$randomEmail}}…) se cargan aparte.
  await loadFaker()
  const out = []
  for (const name of readdirSync(ROOT).filter((n) => statSync(path.join(ROOT, n)).isDirectory())) {
    if (ONLY.length && !ONLY.includes(name)) continue
    const dir = path.join(ROOT, name)
    const read = (f) => (existsSync(path.join(dir, f)) ? JSON.parse(readFileSync(path.join(dir, f), 'utf8')) : {})
    const inputs = read('inputs.json')
    const expect = read('expect.json')
    const files = readdirSync(dir).filter((f) => /\\.ya?ml$/.test(f)).map((f) => parseFile({ name: f, text: readFileSync(path.join(dir, f), 'utf8') }))
    const { projects, errors } = buildCollection(files)
    if (!projects.length) { out.push({ recipe: name, error: errors.join('; ') || 'sin Arazzo' }); continue }
    const byFile = new Map(projects.map((p) => [p.arazzoFileName, analyzeProject(p)]))
    for (const project of projects) {
      const analysis = analyzeProject(project)
      const problems = analysis.workflows.flatMap((w) => (w.issues ?? []).filter((i) => i.level === 'error').map((i) => i.message))
      for (const wa of analysis.workflows) {
        const id = wa.workflow.workflowId
        const started = Date.now()
        const common = { credentials: {}, servers: {}, executor: fetchExecutor, pickList: async (req) => ({ indexes: [req.designed], all: false }) }
        // Si el workflow tiene dependsOn, primero corren sus dependencias (como hace la app) y sus outputs se pasan.
        let workflowOutputs = undefined
        let depError = undefined
        if ((wa.workflow.dependsOn ?? []).length) {
          const dep = await runDependencies(project, analysis, id, {
            ...common,
            // Los valores por defecto de cada dependencia salen de su propio archivo (puede ser otro documento Arazzo).
            inputsFor: (w, file) => ({ ...defaultInputs((byFile.get(file) ?? analysis).workflows.find((x) => x.workflow.workflowId === w)?.inputsSchema), ...(inputs[w] ?? {}) }),
          })
          workflowOutputs = dep.outputs
          depError = dep.error
        }
        const r = depError
          ? { status: 'failed', steps: [], outputs: {}, reason: { message: depError } }
          : await runWorkflow(project, analysis, id, {
              ...common,
              inputs: { ...defaultInputs(wa.inputsSchema), ...(inputs[id] ?? {}) },
              workflowOutputs,
            })
        const want = expect[id] ?? 'success'
        out.push({
          recipe: name, file: project.arazzoFileName, workflow: id, status: r.status, expected: want, ok: r.status === want,
          ms: Date.now() - started, reason: r.reason?.message,
          steps: r.steps.map((s) => ({ step: s.stepId, status: s.status, http: s.response?.status, reason: s.reason?.message, picked: s.picked?.map((p) => p.pointer) })),
          outputs: r.outputs, analysisErrors: problems,
        })
      }
    }
  }
  writeFileSync(${JSON.stringify(report)}, JSON.stringify(out, null, 2))
}, 300000)
`
if (!existsSync(path.join(app, 'node_modules', 'vitest'))) {
  console.error(`No encontré la app de Luvin con sus dependencias en ${app}. Indica su ruta con LUVIN_DIR=…`)
  process.exit(1)
}
mkdirSync(tmp, { recursive: true })
writeFileSync(path.join(tmp, 'recipes.test.ts'), test)
try {
  execFileSync('npx', ['vitest', 'run', path.relative(app, tmp)], { cwd: app, stdio: 'pipe' })
} catch (e) {
  console.error(String(e.stdout ?? '').slice(-2000), String(e.stderr ?? '').slice(-2000))
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
if (!existsSync(report)) process.exit(1)
const rows = JSON.parse(readFileSync(report, 'utf8'))
writeFileSync(latest, JSON.stringify(rows, null, 2))
rmSync(report)
let bad = 0
for (const r of rows) {
  if (r.error) { bad++; console.log(`✕ ${r.recipe}: ${r.error}`); continue }
  if (!r.ok) bad++
  console.log(`${r.ok ? '✓' : '✕'} ${r.recipe} · ${r.workflow}: ${r.status}${r.ok ? '' : ` (se esperaba ${r.expected})`} · ${r.ms} ms`)
  for (const s of r.steps) console.log(`    ${s.status === 'success' ? '·' : '!'} ${s.step} ${s.http ?? ''} ${s.status}${s.reason ? ` — ${s.reason}` : ''}${s.picked?.length ? ` (lista: ${s.picked.join(', ')})` : ''}`)
  for (const e of r.analysisErrors ?? []) console.log(`    análisis: ${e}`)
}
console.log(`\n${rows.length - bad} de ${rows.length} pasan. Detalle: .recipes-report.json`)
process.exit(bad ? 1 : 0)
