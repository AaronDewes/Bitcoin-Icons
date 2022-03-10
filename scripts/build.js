const fs = require('fs').promises
const camelcase = require('camelcase')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))
const svgr = require('@svgr/core').transform
const babel = require('@babel/core')
const { compile: compileVue } = require('@vue/compiler-dom')

const rawTypeDefinition = `declare const iconData: { name: string; svg: string; };
export default iconData;`;

let transform = {
  react: async (svg, componentName, format) => {
    let component = await svgr(svg, {}, { componentName })
    let { code } = await babel.transformAsync(component, {
      plugins: [[require('@babel/plugin-transform-react-jsx'), { useBuiltIns: true }]],
    })

    if (format === 'esm') {
      return code
    }

    return code
      .replace('import * as React from "react"', 'const React = require("react")')
      .replace('export default', 'module.exports =')
  },
  vue: (svg, componentName, format) => {
    let { code } = compileVue(svg, {
      mode: 'module',
    })

    if (format === 'esm') {
      return code.replace('export function', 'export default function')
    }

    return code
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+(['"])(.*?)\2/,
        (_match, imports, _quote, mod) => {
          let newImports = imports
            .split(',')
            .map((i) => i.trim().replace(/\s+as\s+/, ': '))
            .join(', ')

          return `const { ${newImports} } = require("${mod}")`
        }
      )
      .replace('export function render', 'module.exports = function render')
  },
  raw: (svg, componentName, format, type) => {
    let code = `const iconData = {
  name: "${componentName}",
  svg: \`${svg.trim()}\`,
};

module.exports = iconData;`

    if (format === 'esm') {
      return code.replace('\n\nmodule.exports = iconData;', '').replace('\n\nmodule.exports = iconData;', 'const iconData = {', 'export default const iconData = {')
    }

    return code;
  },
}

async function getIcons(style) {
  let files = await fs.readdir(`./optimized/${style}`)
  return Promise.all(
    files.map(async (file) => ({
      svg: await fs.readFile(`./optimized/${style}/${file}`, 'utf8'),
      componentName: `${camelcase(file.replace(/\.svg$/, ''), {
        pascalCase: true,
      })}Icon`,
    }))
  )
}

function exportAll(icons, format, includeExtension = true) {
  return icons
    .map(({ componentName }) => {
      let extension = includeExtension ? '.js' : ''
      if (format === 'esm') {
        return `export { default as ${componentName} } from './${componentName}${extension}'`
      }
      return `module.exports.${componentName} = require("./${componentName}${extension}")`
    })
    .join('\n')
}

async function buildIcons(package, style, format) {
  let outDir = `./packages/${package}/${style}`
  if (format === 'esm') {
    outDir += '/esm'
  }

  await fs.mkdir(outDir, { recursive: true })

  let icons = await getIcons(style)

  await Promise.all(
    icons.flatMap(async ({ componentName, svg }) => {
      let content = await transform[package](svg, componentName, format)
      let types

      if (package === 'react') {
        types = `import * as React from 'react';\ndeclare function ${componentName}(props: React.ComponentProps<'svg'>): JSX.Element;\nexport default ${componentName};\n`
      }

      if (package === 'raw') {
        types = rawTypeDefinition;
      }

      return [
        fs.writeFile(`${outDir}/${componentName}.js`, content, 'utf8'),
        ...(types ? [fs.writeFile(`${outDir}/${componentName}.d.ts`, types, 'utf8')] : []),
      ]
    })
  )

  await fs.writeFile(`${outDir}/index.js`, exportAll(icons, format), 'utf8')

  if (package === 'react' || package === 'raw') {
    await fs.writeFile(`${outDir}/index.d.ts`, exportAll(icons, 'esm', false), 'utf8')
  }
}

function main(package) {
  console.log(`Building ${package} package...`)

  Promise.all([rimraf(`./packages/${package}/outline/*`), rimraf(`./packages/${package}/filled/*`)])
    .then(() =>
      Promise.all([
        buildIcons(package, 'filled', 'esm'),
        buildIcons(package, 'filled', 'cjs'),
        buildIcons(package, 'outline', 'esm'),
        buildIcons(package, 'outline', 'cjs'),
        fs.writeFile(`./packages/${package}/outline/package.json`, `{"module": "./esm/index.js"}`, 'utf8'),
        fs.writeFile(`./packages/${package}/filled/package.json`, `{"module": "./esm/index.js"}`, 'utf8'),
      ])
    )
    .then(() => console.log(`Finished building ${package} package.`))
}

let [package] = process.argv.slice(2)

if (!package) {
  throw Error('Please specify a package')
}

main(package)