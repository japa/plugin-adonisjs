/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import getPort from 'get-port'
import { getActiveTest } from '@japa/runner'
import { IgnitorFactory } from '@adonisjs/core/factories'
import { AppEnvironments } from '@adonisjs/core/types/app'
import type { ApplicationService } from '@adonisjs/core/types'
import { IncomingMessage, ServerResponse, createServer } from 'node:http'

/**
 * Create a HTTP server to handle request
 */
export async function createHttpServer(
  handler: (req: IncomingMessage, res: ServerResponse) => any
) {
  const server = createServer(handler)
  const host = '127.0.0.1'
  const port = await getPort({ port: 3000 })
  const url = `http://${host}:${port}`

  await new Promise<void>((resolve) => {
    server.listen(port, host, () => {
      resolve()
    })
  })

  const test = getActiveTest()
  test?.cleanup(() => {
    return new Promise<void>((resolve, reject) =>
      server.close((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    )
  })

  return { url, server, port, host }
}

/**
 * The BASE_URL becomes the root of a virtual application you
 * will be creating during tests. Make sure the path of this
 * is ephemeral, since some test hooks will delete this
 * directory.
 */
export const BASE_URL = new URL('./tmp/', import.meta.url)

/**
 * The importer is required by the AdonisJS application to import
 * files behind the scenes in context of this package.
 *
 * The importer is required, because the "import.meta.resolve" API
 * of Node.js is currently experimental and hence we avoid using
 * it.
 */
export const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, BASE_URL).href)
  }

  return import(filePath)
}

/**
 * Boots the AdonisJS application by registering the base config and providers
 * from the "@adonisjs/core" package.
 */
export async function bootApplication(
  environment: AppEnvironments,
  ignitorOptions?: Partial<{
    rcFileContents: Record<string, any>
    config: Record<string, any>
  }>
): Promise<ApplicationService> {
  const ignitor = new IgnitorFactory()
    .withCoreConfig()
    .withCoreProviders()
    .merge(ignitorOptions || {})
    .create(BASE_URL, {
      importer: IMPORTER,
    })

  const app = ignitor.createApp(environment)
  await app.init()
  await app.boot()

  return app
}
