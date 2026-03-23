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
import type { BindingResolver } from '@adonisjs/core/types/container'
import { type AbstractConstructor } from '@adonisjs/core/types/common'

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

/**
 * Swap a container binding with a fake implementation for the
 * duration of the current test. The original binding is automatically
 * restored after the test completes.
 *
 * Standalone version of `TestContext.swap` that can be called
 * from anywhere within a running test
 *
 * @example
 * ```ts
 * import { useFake } from '@japa/plugin-adonisjs/helpers'
 *
 * function swapMailer() {
 *   return useFake(Mailer, new FakeMailer())
 * }
 * ```
 */
export function useFake<Binding extends AbstractConstructor<any>>(
  binding: Binding,
  fake: InstanceType<Binding> | BindingResolver<any, InstanceType<Binding>>
): InstanceType<Binding> {
  const activeTest = getActiveTest()
  if (!activeTest) throw new Error('Cannot use "useFake" outside of a Japa test')

  return activeTest.context.swap(binding, fake)
}
