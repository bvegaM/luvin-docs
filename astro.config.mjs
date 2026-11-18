// Documentación de Luvin. Inglés en / y español en /es/, igual que el sitio (luvin-web).
// Todo es estático: `npm run build` deja el sitio en dist/, con el buscador incluido.
import { existsSync, readdirSync } from 'node:fs'
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// La barra lateral: una sección por carpeta de src/content/docs/ (es también una pestaña del menú de
// arriba), dividida en subtemas. El nombre de cada página sale de su `title`, en su idioma.
// Solo se incluyen las páginas que existen, y una página de la carpeta que no esté en ningún subtema
// se agrega al final de su sección: así una página nueva nunca queda fuera del menú.
const DOCS = new URL('./src/content/docs/', import.meta.url)
const exists = (slug) => ['.md', '.mdx'].some((ext) => existsSync(new URL(slug + ext, DOCS)))
const inDir = (dir) =>
  existsSync(new URL(dir + '/', DOCS))
    ? readdirSync(new URL(dir + '/', DOCS)).filter((f) => /\.mdx?$/.test(f)).map((f) => `${dir}/${f.replace(/\.mdx?$/, '')}`).sort()
    : []
function section(label, es, dir, groups) {
  const listed = new Set(groups.flatMap((g) => (Array.isArray(g) ? g[2] : [g])).map((x) => `${dir}/${x}`))
  const items = groups
    .map((g) => {
      if (!Array.isArray(g)) return exists(`${dir}/${g}`) ? `${dir}/${g}` : undefined
      const pages = g[2].map((x) => `${dir}/${x}`).filter(exists)
      return pages.length ? { label: g[0], translations: { es: g[1] }, items: pages } : undefined
    })
    .filter(Boolean)
  const rest = inDir(dir).filter((x) => !listed.has(x))
  return { label, translations: { es }, items: [...items, ...rest] }
}
const sidebar = [
  section('Get started', 'Empieza aquí', 'get-started', ['welcome', 'quick-start', 'install', 'interface', 'sidebar', 'preferences', 'guided-tour', 'import', 'troubleshooting']),
  section('Examples', 'Ejemplos', 'recipes', [
    'overview',
    ['Log in and tokens', 'Login y tokens', ['login-token', 'depends-on', 'cross-document']],
    ['Work with data', 'Trabajar con datos', ['list-pick', 'pagination-query', 'generated-data']],
    ['Checks and errors', 'Comprobaciones y errores', ['expected-error', 'criteria', 'error-branches', 'retry-step']],
  ]),
  section('Tutorials', 'Tutoriales', 'tutorials', ['first-workflow', 'from-postman', 'oauth-payment', 'negative-cases', 'debug-failure', 'team-git']),
  section('Design workflows', 'Diseñar workflows', 'design', [
    ['Basics', 'Lo básico', ['overview', 'create', 'add-steps', 'organize', 'arazzo-file']],
    ['Data between steps', 'Datos entre pasos', ['wire-data', 'parameters-and-body', 'outputs', 'complete-gaps', 'required-fields']],
    ['Control the flow', 'Controlar el recorrido', ['success-and-errors', 'dependencies', 'reusables']],
    ['Other kinds of steps', 'Otros tipos de pasos', ['messaging', 'from-requests']],
    ['The Arazzo file', 'El archivo Arazzo', ['arazzo-editor']],
  ]),
  section('Test workflows', 'Probar workflows', 'test', [
    ['Inputs and cases', 'Inputs y casos', ['inputs', 'cases', 'adjust-cases', 'custom-cases']],
    ['Run', 'Ejecutar', ['run', 'lists', 'simulation']],
    ['Results', 'Resultados', ['results', 'step-results', 'overview-tab', 'reports']],
  ]),
  section('Send requests', 'Enviar requests', 'requests', [
    ['Basics', 'Lo básico', ['overview', 'http', 'params-headers-body', 'auto-headers', 'send-files', 'response-details', 'files', 'cookies-and-examples']],
    ['Other protocols', 'Otros protocolos', ['graphql', 'grpc', 'websocket']],
    ['Create requests faster', 'Crear requests más rápido', ['curl', 'generate-from-contract']],
  ]),
  section('Contracts', 'Contratos', 'contracts', ['overview', 'edit', 'try-it-out', 'asyncapi', 'remote-and-refs']),
  section('Environments', 'Ambientes', 'environments', ['overview', 'variables-and-secrets', 'dynamic-variables']),
  section('Authorization', 'Autorización', 'authorization', [
    ['Start here', 'Empieza aquí', ['overview', 'where-it-applies', 'inherit-and-none']],
    ['Types', 'Tipos', ['api-key', 'basic', 'bearer', 'oauth2', 'oauth1', 'digest', 'ntlm', 'aws-sigv4', 'akamai', 'wsse']],
    ['Collections and workflows', 'Colecciones y workflows', ['contract-credentials', 'collection', 'workflow']],
    ['Security and problems', 'Seguridad y problemas', ['secrets', 'troubleshooting']],
  ]),
  section('Workspaces', 'Workspaces', 'workspaces', [
    ['Workspaces and collections', 'Workspaces y colecciones', ['overview', 'create-and-open', 'collections', 'collection-authorization', 'collection-overview']],
    ['Documentation', 'Documentación', ['documentation']],
    ['Files and teams', 'Archivos y equipos', ['files', 'git', 'without-workspace']],
  ]),
  section('Dev Tools', 'Dev Tools', 'dev-tools', ['overview', 'network', 'console-and-performance', 'terminal', 'connection-help']),
  section('Reference', 'Referencia', 'reference', [
    ['Specifications', 'Especificaciones', ['support', 'limitations']],
    ['Syntax', 'Sintaxis', ['expressions', 'criteria', 'shortcuts']],
    ['Messages', 'Mensajes', ['failure-reasons', 'analysis-messages']],
    ['Help', 'Ayuda', ['faq', 'glossary', 'examples', 'privacy', 'whats-new']],
  ]),
]

export default defineConfig({
  // Dónde se publica: se usa en las URLs canónicas y en el mapa del sitio. Cámbialo si el dominio es otro.
  site: 'https://docs.lu-vin.com',
  integrations: [
    starlight({
      title: 'Luvin Docs',
      description: 'Test the chain, not just the call. How to design, run and share API workflows with Luvin.',
      logo: { src: './src/assets/logo.svg', alt: '' },
      favicon: '/favicon.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        es: { label: 'Español', lang: 'es' },
      },
      customCss: ['@fontsource-variable/inter', './src/styles/luvin.css'],
      // Piezas propias: la portada con buscador grande y la sección sobre el título de cada página.
      components: {
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        Search: './src/components/Search.astro',
        Sidebar: './src/components/Sidebar.astro',
        TableOfContents: './src/components/TableOfContents.astro',
        Hero: './src/components/Hero.astro',
        PageTitle: './src/components/PageTitle.astro',
      },
      sidebar,
    }),
  ],
})
