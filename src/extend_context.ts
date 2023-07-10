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
import { TestContext } from '@japa/runner/core'
import type { Router } from '@adonisjs/core/http'

import debug from './debug.js'

export function extendContext(router: Router, repl: Repl) {
  debug('extending japa context with adonisjs specific methods')

  TestContext.macro('route', function (this: TestContext, routeIdentifier, params?, options?) {
    return router.makeUrl(routeIdentifier, params, options)
  })

  TestContext.macro('startRepl', function (this: TestContext, context) {
    this.test.resetTimeout()

    return new Promise((resolve) => {
      /**
       * Share context
       */
      repl.ready(() => {
        Object.keys(context).forEach((key) => {
          repl.server!.context[key] = context[key]
        })
      })

      /**
       * Resolve promise
       */
      repl.server!.on('exit', () => {
        resolve()
      })

      /**
       * Start REPL
       */
      repl.start()
    })
  })
}
