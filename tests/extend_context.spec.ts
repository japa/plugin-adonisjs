/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test, TestContext } from '@japa/runner'
import type { ApplicationService } from '@adonisjs/core/types'

import { bootApplication } from './bootstrap.js'
import { extendContext } from '../src/extend_context.js'

test.group('Extend TestContext', (group) => {
  let app: ApplicationService

  group.setup(async () => {
    app = await bootApplication('web')
    const router = await app.container.make('router')
    extendContext(router)
  })

  test('add route helper to TestContext', async ({ assert }) => {
    const router = await app.container.make('router')
    router.get('posts/:id', () => {}).as('posts.show')
    router.commit()

    assert.equal(new TestContext({} as any).route('posts.show', [1]), '/posts/1')
  })
})
