/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { PluginFn } from '@japa/runner'
import { CookieClient } from '@adonisjs/core/http'
import { ApplicationService } from '@adonisjs/core/types'
import { extendContext } from './src/extend_context.js'

/**
 * Find if a given package can be imported.
 */
async function canImport(pkg: string) {
  try {
    await import(pkg)
    return true
  } catch {
    return false
  }
}

/**
 * The AdonisJS plugin acts as a bridge between an AdonisJS application
 * and the Japa test runner.
 *
 * The plugin extends the Japa runner and the ecosystem plugins to have to
 * first class knowledge about AdonisJS
 */
export function pluginAdonisJS(app: ApplicationService, options?: { baseURL: string }) {
  const pluginFn: PluginFn = async function () {
    extendContext(await app.container.make('router'))

    /**
     * Extend "@japa/api-client" plugin
     */
    if (await canImport('@japa/api-client')) {
      const { extendApiClient } = await import('./src/extend_api_client.js')
      extendApiClient(new CookieClient(await app.container.make('encryption')))
    }

    /**
     * Extend "@japa/browser-client" plugin
     */
    if ((await canImport('@japa/browser-client')) && (await canImport('playwright'))) {
      const { extendBrowserClient } = await import('./src/extend_browser_client.js')
      extendBrowserClient(
        new CookieClient(await app.container.make('encryption')),
        options?.baseURL
      )
    }
  }
  return pluginFn
}
