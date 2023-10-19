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
import { Emitter, Group, Refiner, Runner, Suite, Test, TestContext } from '@japa/runner/core'

import { bootApplication } from '../tests_helpers/bootstrap.js'
import { verifyPrompts } from '../src/verify_prompts.js'

test.group('Verify prompts', (group) => {
  let app: ApplicationService

  group.setup(async () => {
    app = await bootApplication('web')
  })

  test('throw error when trapped prompt is not triggered', async ({ assert }) => {
    const refiner = new Refiner()
    const emitter = new Emitter()
    const runner = new Runner(emitter)
    const suite = new Suite('Unit', emitter, refiner)
    const t = new Test('sample test', (self) => new TestContext(self), emitter, refiner)
    const ace = await app.container.make('ace')
    verifyPrompts(ace, runner)

    t.run(async () => {
      ace.prompt.trap('What is your name?')
    })

    runner.add(suite)
    suite.add(t)
    await runner.start()
    await runner.exec()
    await runner.end()

    const summary = runner.getSummary()
    assert.isTrue(summary.hasError)

    const error = summary.failureTree[0].children[0].errors[0]
    assert.equal(error.phase, 'teardown')
    assert.equal(error.error.message, 'Expected prompt "What is your name?" to get triggered')
  })

  test('do not throw error when trapped prompt gets triggered', async ({ assert }) => {
    const refiner = new Refiner()
    const emitter = new Emitter()
    const runner = new Runner(emitter)
    const suite = new Suite('Unit', emitter, refiner)
    const testGroup = new Group('Sample', emitter, refiner)
    const t = new Test('sample test', (self) => new TestContext(self), emitter, refiner)
    const ace = await app.container.make('ace')
    verifyPrompts(ace, runner)

    t.run(async () => {
      ace.prompt.trap('What is your name?').replyWith('Virk')
      const name = await ace.prompt.ask('What is your name?')
      assert.equal(name, 'Virk')
    })

    runner.add(suite)
    suite.add(testGroup)
    testGroup.add(t)
    await runner.start()
    await runner.exec()
    await runner.end()

    const summary = runner.getSummary()
    assert.isFalse(summary.hasError)
  })
})
