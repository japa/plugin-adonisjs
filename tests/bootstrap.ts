/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import getPort from 'get-port'
import { IgnitorFactory } from '@adonisjs/core/factories'
import { AppEnvironments } from '@adonisjs/core/types/app'
import type { ApplicationService } from '@adonisjs/core/types'
import { IncomingMessage, ServerResponse, createServer } from 'node:http'

export const SERVER_HOST = '127.0.0.1'
export const SERVER_PORT = await getPort({ port: 3000 })
export const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`

/**
 * Create a HTTP server to handle request
 */
export async function createHttpServer(
  handler: (req: IncomingMessage, res: ServerResponse) => any
) {
  const server = createServer(handler)
  await new Promise<void>((resolve) => {
    server.listen(SERVER_PORT, SERVER_HOST, () => {
      resolve()
    })
  })

  /**
   * Closes http server
   */
  return () =>
    new Promise<void>((resolve, reject) =>
      server.close((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    )
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
