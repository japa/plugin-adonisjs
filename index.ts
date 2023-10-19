/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './src/types/extended.js'
import type { PluginFn } from '@japa/runner/types'
import { CookieClient } from '@adonisjs/core/http'
import type { ApplicationService } from '@adonisjs/core/types'

import { extendContext } from './src/extend_context.js'
import { verifyPrompts } from './src/verify_prompts.js'

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
  const pluginFn: PluginFn = async function ({ runner }) {
    if (app.container.hasAllBindings(['router', 'repl'])) {
      extendContext(await app.container.make('router'), await app.container.make('repl'))
    }

    /**
     * Extend "@japa/api-client" plugin
     */
    if ((await canImport('@japa/api-client')) && app.container.hasBinding('encryption')) {
      const { extendApiClient } = await import('./src/extend_api_client.js')
      extendApiClient(new CookieClient(await app.container.make('encryption')))
    }

    /**
     * Extend "@japa/browser-client" plugin
     */
    if (
      (await canImport('@japa/browser-client')) &&
      (await canImport('playwright')) &&
      app.container.hasBinding('encryption')
    ) {
      const { extendBrowserClient } = await import('./src/extend_browser_client.js')
      extendBrowserClient(
        new CookieClient(await app.container.make('encryption')),
        options?.baseURL
      )
    }

    /**
     * Verify prompts that were trapped but never triggered
     */
    if (app.container.hasBinding('ace')) {
      const ace = await app.container.make('ace')
      verifyPrompts(ace, runner)
    }
  }
  return pluginFn
}
