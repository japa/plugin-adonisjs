/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { getActiveTest } from '@japa/runner'
import { TestContext } from '@japa/runner/core'
import type { Container } from '@adonisjs/core/container'

import './types/extended.js'
import debug from './debug.ts'

/**
 * Extends the Japa test context with a `swap` method that allows
 * replacing a container binding with a fake for the duration of the test.
 *
 * The original binding is automatically restored after the test completes.
 */
export function extendSwap(container: Container<any>) {
  debug('extending japa context with container swap method')

  TestContext.macro('swap', function (binding: any, fake: any) {
    const activeTest = getActiveTest()
    if (!activeTest) throw new Error('Cannot use "swap" outside of a Japa test')

    container.swap(binding, typeof fake === 'function' ? fake : () => fake)

    activeTest.cleanup(() => container.restore(binding))

    return fake
  })
}
