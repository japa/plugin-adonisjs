/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Repl } from '@adonisjs/core/repl'
import { TestContext } from '@japa/runner/core'
import type { Router } from '@adonisjs/core/http'

import './types/extended.js'
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

  TestContext.macro('route', function (this: TestContext, ...args) {
    const [identifier, params, options] = args as any[]
    return (router.urlBuilder.urlFor as any)(identifier, params, options)
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
