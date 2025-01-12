/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './types/extended.js'
import { Repl } from '@adonisjs/core/repl'
import type { Router } from '@adonisjs/core/http'
import { TestContext } from '@japa/runner/core'

import debug from './debug.js'

export function extendContext(router: Router, repl: Repl) {
  debug('extending japa context with adonisjs specific methods')

  /**
   * Starts the AdonisJS repl and resolves the promise when
   * the repl is exited.
   */
  function startRepl(context?: Record<any, any>) {
    return new Promise<void>((resolve) => {
      repl.start(context)
      repl.server!.on('exit', () => {
        resolve()
      })
    })
  }

  TestContext.macro('route', function (this: TestContext, routeIdentifier, params?, options?) {
    return router.makeUrl(routeIdentifier, params, options)
  })

  TestContext.getter('repl', function (this: TestContext) {
    return {
      start: (context) => {
        this.test.resetTimeout()
        return startRepl(context)
      },
    }
  })
}
