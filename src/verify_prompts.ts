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
 * Verifies prompts after every ace test
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
