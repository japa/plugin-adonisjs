/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import { CookieClient } from '@adonisjs/core/http'

import { extendApiClient } from '../src/extend_api_client.js'
import { bootApplication, createHttpServer } from '../tests_helpers/bootstrap.js'

test.group('Extend ApiClient', () => {
  test('send signed cookie to the server', async ({ assert }) => {
    assert.plan(2)

    /**
     * Setup
     */
    const app = await bootApplication('web')
    const encryption = await app.container.make('encryption')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    router.get('/', ({ request }) => {
      assert.equal(request.cookie('username'), 'virk')
    })
    await server.boot()
    extendApiClient(new CookieClient(encryption))

    /**
     * Cleanup
     */
    const { url } = await createHttpServer(server.handle.bind(server))

    /**
     * Test
     */
    const client = new ApiClient(url)
    const response = await client.get('/').withCookie('username', 'virk')
    assert.equal(response.status(), 200)
  })

  test('send multiple signed cookies to the server', async ({ assert }) => {
    assert.plan(2)

    /**
     * Setup
     */
    const app = await bootApplication('web')
    const encryption = await app.container.make('encryption')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    router.get('/', ({ request }) => {
      assert.equal(request.cookie('username'), 'virk')
    })
    await server.boot()
    extendApiClient(new CookieClient(encryption))

    /**
     * Cleanup
     */
    const { url } = await createHttpServer(server.handle.bind(server))

    /**
     * Test
     */
    const client = new ApiClient(url)
    const response = await client.get('/').cookies({ username: 'virk' })
    assert.equal(response.status(), 200)
  })

  test('send encrypted cookie to the server', async ({ assert }) => {
    assert.plan(2)

    /**
     * Setup
     */
    const app = await bootApplication('web')
    const encryption = await app.container.make('encryption')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    router.get('/', ({ request }) => {
      assert.equal(request.encryptedCookie('username'), 'virk')
    })
    await server.boot()
    extendApiClient(new CookieClient(encryption))

    /**
     * Cleanup
     */
    const { url } = await createHttpServer(server.handle.bind(server))

    /**
     * Test
     */
    const client = new ApiClient(url)
    const response = await client.get('/').withEncryptedCookie('username', 'virk')
    assert.equal(response.status(), 200)
  })

  test('send plain cookie to the server', async ({ assert }) => {
    assert.plan(2)

    /**
     * Setup
     */
    const app = await bootApplication('web')
    const encryption = await app.container.make('encryption')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    router.get('/', ({ request }) => {
      assert.equal(request.plainCookie('username'), 'virk')
    })
    await server.boot()
    extendApiClient(new CookieClient(encryption))

    /**
     * Cleanup
     */
    const { url } = await createHttpServer(server.handle.bind(server))

    /**
     * Test
     */
    const client = new ApiClient(url)
    const response = await client.get('/').withPlainCookie('username', 'virk')
    assert.equal(response.status(), 200)
  })

  test('parse response cookies', async ({ assert }) => {
    /**
     * Setup
     */
    const app = await bootApplication('web')
    const encryption = await app.container.make('encryption')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    router.get('/', ({ response }) => {
      response.cookie('username', 'virk')
      response.encryptedCookie('email', 'foo@bar.com')
      response.plainCookie('id', '1')
    })
    await server.boot()
    extendApiClient(new CookieClient(encryption))

    /**
     * Cleanup
     */
    const { url } = await createHttpServer(server.handle.bind(server))

    /**
     * Test
     */
    const client = new ApiClient(url)
    const response = await client.get('/')
    const cookies = response.cookies()

    assert.equal(response.status(), 200)
    assert.equal(cookies.username.value, 'virk')
    assert.equal(cookies.email.value, 'foo@bar.com')
    assert.equal(cookies.id.value, '1')
  })

  test('parse expired response cookies', async ({ assert }) => {
    /**
     * Setup
     */
    const app = await bootApplication('web')
    const encryption = await app.container.make('encryption')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    router.get('/', ({ response }) => {
      response.cookie('username', 'virk')
      response.clearCookie('id')
    })
    await server.boot()
    extendApiClient(new CookieClient(encryption))

    /**
     * Cleanup
     */
    const { url } = await createHttpServer(server.handle.bind(server))

    /**
     * Test
     */
    const client = new ApiClient(url)
    const response = await client.get('/')
    const cookies = response.cookies()

    assert.equal(response.status(), 200)
    assert.equal(cookies.id.value, '')
    assert.equal(cookies.id.maxAge, -1)
    assert.deepEqual(cookies.id.expires, new Date(0))
  })
})
