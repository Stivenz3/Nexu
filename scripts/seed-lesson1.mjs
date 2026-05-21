/**
 * @deprecated Usar: node seed-lesson.mjs 01  o  npm run seed:lesson1
 */
import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const child = spawn(process.execPath, [join(__dirname, 'seed-lesson.mjs'), '01'], {
  stdio: 'inherit',
})
child.on('exit', (code) => process.exit(code ?? 1))
