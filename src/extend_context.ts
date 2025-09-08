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
import debug from './debug.ts'

/**
 * Extends the Japa test context with AdonisJS-specific methods.
 *
 * This function adds route generation and REPL functionality to the test context.
 * It provides access to AdonisJS router for URL generation and allows starting
 * the AdonisJS REPL during tests for interactive debugging.
 *
 * @param router - The AdonisJS HTTP router instance
 * @param repl - The AdonisJS REPL instance
 *
 * @example
 * ```js
 * extendContext(app.container.use('router'), app.container.use('repl'))
 * ```
 */
export function extendContext(router: Router, repl: Repl) {
  debug('extending japa context with adonisjs specific methods')

  /**
   * Starts the AdonisJS REPL and resolves when the REPL is exited.
   *
   * This function creates a promise that resolves when the REPL session ends,
   * allowing for interactive debugging during test execution.
   *
   * @param context - Optional context object to make available in the REPL
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
