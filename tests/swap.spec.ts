/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { getActiveTest, test } from '@japa/runner'
import type { ApplicationService } from '@adonisjs/core/types'
import { Emitter, Refiner, Runner, Suite, Test, TestContext } from '@japa/runner/core'

import { extendSwap, useFake } from '../src/swap.ts'
import { bootApplication } from '../tests_helpers/bootstrap.ts'

class Mailer {
  send(_to: string, _body: string) {}
}

class FakeMailer extends Mailer {
  sent: Array<{ to: string; body: string }> = []

  override send(to: string, body: string) {
    this.sent.push({ to, body })
  }
}

test.group('Swap', (group) => {
  let app: ApplicationService

  group.setup(async () => {
    app = await bootApplication('web')
  })

  test('swap a container binding within a test', async ({ assert }) => {
    const refiner = new Refiner()
    const emitter = new Emitter()
    const runner = new Runner(emitter)
    const suite = new Suite('Unit', emitter, refiner)
    const t = new Test('sample test', (self) => new TestContext(self), emitter, refiner)

    app.container.bind(Mailer, () => new Mailer())
    extendSwap(app.container)

    const fakeMailer = new FakeMailer()

    t.run(async ({ swap }) => {
      swap(Mailer, fakeMailer)
      const resolved = await app.container.make(Mailer)
      assert.strictEqual(resolved, fakeMailer)
    })

    runner.add(suite)
    suite.add(t)
    await runner.start()
    await runner.exec()
    await runner.end()

    const summary = runner.getSummary()
    assert.isFalse(summary.hasError)
  })

  test('restore the binding after the test completes', async ({ assert, cleanup }) => {
    app.container.bind(Mailer, () => new Mailer())
    extendSwap(app.container)

    const fakeMailer = new FakeMailer()
    const { swap } = new TestContext({} as any)
    swap(Mailer, fakeMailer)

    const swapped = await app.container.make(Mailer)
    assert.strictEqual(swapped, fakeMailer)

    /**
     * getActiveTest().cleanup() registered the restore.
     * After this test ends, `container.restore(Mailer)` will run.
     * We can verify by manually calling restore here.
     */
    app.container.restore(Mailer)
    const restored = await app.container.make(Mailer)
    assert.isFalse(restored instanceof FakeMailer)

    cleanup(() => app.container.restore(Mailer))
  })

  test('swap with a factory function', async ({ assert }) => {
    const refiner = new Refiner()
    const emitter = new Emitter()
    const runner = new Runner(emitter)
    const suite = new Suite('Unit', emitter, refiner)
    const t = new Test('sample test', (self) => new TestContext(self), emitter, refiner)

    app.container.bind(Mailer, () => new Mailer())
    extendSwap(app.container)

    t.run(async ({ swap }) => {
      swap(Mailer, () => new FakeMailer())
      const resolved = await app.container.make(Mailer)
      assert.instanceOf(resolved, FakeMailer)
    })

    runner.add(suite)
    suite.add(t)
    await runner.start()
    await runner.exec()
    await runner.end()

    const summary = runner.getSummary()
    assert.isFalse(summary.hasError)
  })

  test('swap via a userland helper using getActiveTest', async ({ assert, cleanup }) => {
    app.container.bind(Mailer, () => new Mailer())
    extendSwap(app.container)

    /**
     * Simulates a userland helper that wraps swap
     * e.g. in tests_helpers/fakes.ts
     */
    function swapMailer() {
      const t = getActiveTest()!
      const fake = new FakeMailer()
      t.context.swap(Mailer, fake)

      return fake
    }

    const fake = swapMailer()
    const resolved = await app.container.make(Mailer)
    assert.strictEqual(resolved, fake)

    cleanup(() => app.container.restore(Mailer))
  })

  test('swap via useFake standalone helper', async ({ assert, cleanup }) => {
    app.container.bind(Mailer, () => new Mailer())
    extendSwap(app.container)

    const fake = useFake(Mailer, new FakeMailer())
    const resolved = await app.container.make(Mailer)

    assert.instanceOf(fake, FakeMailer)
    assert.strictEqual(resolved, fake)

    cleanup(() => app.container.restore(Mailer))
  })
})
