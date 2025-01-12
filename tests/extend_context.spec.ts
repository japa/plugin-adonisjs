/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import type { ApplicationService } from '@adonisjs/core/types'
import { Emitter, Refiner, Runner, Suite, Test, TestContext } from '@japa/runner/core'

import { extendContext } from '../src/extend_context.js'
import { bootApplication } from '../tests_helpers/bootstrap.js'

test.group('Extend TestContext', (group) => {
  let app: ApplicationService

  group.setup(async () => {
    app = await bootApplication('web')
  })

  test('add route helper to TestContext', async ({ assert }) => {
    const router = await app.container.make('router')
    const repl = await app.container.make('repl')
    extendContext(router, repl)

    router.get('posts/:id', () => {}).as('posts.show')
    router.commit()

    assert.equal(new TestContext({} as any).route('posts.show', [1]), '/posts/1')
  })

  test('add startRepl helper to TestContext', async ({ assert }) => {
    assert.plan(1)

    const router = await app.container.make('router')
    const repl = await app.container.make('repl')
    const refiner = new Refiner()
    const emitter = new Emitter()
    const runner = new Runner(emitter)
    const suite = new Suite('Unit', emitter, refiner)
    const t = new Test('sample test', (self) => new TestContext(self), emitter, refiner)

    extendContext(router, repl)

    t.run(({ repl: r }) => {
      assert.isFunction(r.start)
    })

    runner.add(suite)
    suite.add(t)
    await runner.start()
    await runner.exec()
    await runner.end()
  })
})
