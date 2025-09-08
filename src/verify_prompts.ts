/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Kernel } from '@adonisjs/core/ace'
import type { Runner } from '@japa/runner/core'

/**
 * Verifies prompts after every ace test.
 *
 * This function sets up teardown hooks to verify that all prompts have been handled
 * properly during tests. It ensures that any prompts trapped during tests are verified
 * after each test or group teardown.
 *
 * @param ace - The AdonisJS Ace kernel instance containing prompt traps
 * @param runner - The Japa test runner instance to attach hooks to
 *
 * @example
 * ```js
 * verifyPrompts(app.container.use('ace'), runner)
 * ```
 */
export function verifyPrompts(ace: Kernel, runner: Runner) {
  runner.onSuite((suite) => {
    suite.onGroup((group) => {
      group.each.teardown(() => {
        ace.prompt.traps.verify()
      })
    })

    suite.onTest((test) => {
      test.teardown(() => {
        ace.prompt.traps.verify()
      })
    })
  })
}
