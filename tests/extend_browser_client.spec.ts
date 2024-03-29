/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { chromium } from 'playwright'
import { CookieClient } from '@adonisjs/core/http'
import { decorateBrowser, decoratorsCollection } from '@japa/browser-client'

import { extendBrowserClient } from '../src/extend_browser_client.js'
import { bootApplication, createHttpServer } from '../tests_helpers/bootstrap.js'

test.group('Extend Browser client', (group) => {
  group.tap((t) => t.timeout(8000))

  test('send signed cookie to the server', async ({ assert, cleanup }) => {
    assert.plan(1)

    /**
     * Setup
     */
    const app = await bootApplication('web')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    const encryption = await app.container.make('encryption')

    router.get('/', ({ request }) => {
      return `<html>
        <body>
          <input name="cookie" value="${request.cookie('username')}" />
        </body>
      </html>`
    })
    await server.boot()

    const { url } = await createHttpServer(server.handle.bind(server))
    const browser = await chromium.launch()
    extendBrowserClient(new CookieClient(encryption), url)
    decorateBrowser(browser, decoratorsCollection.toList())
    cleanup(async () => {
      await browser.close()
    })

    /**
     * Test
     */
    const context = await browser.newContext()
    await context.setCookie('username', 'virk')

    const page = await context.newPage()
    await page.goto(url)
    assert.equal(await page.inputValue('input[name="cookie"]'), 'virk')
  })

  test('send encrypted cookie to the server', async ({ assert, cleanup }) => {
    assert.plan(1)

    /**
     * Setup
     */
    const app = await bootApplication('web')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    const encryption = await app.container.make('encryption')

    router.get('/', ({ request }) => {
      return `<html>
        <body>
          <input name="cookie" value="${request.encryptedCookie('username')}" />
        </body>
      </html>`
    })
    await server.boot()

    const { url } = await createHttpServer(server.handle.bind(server))
    const browser = await chromium.launch()
    extendBrowserClient(new CookieClient(encryption), url)
    decorateBrowser(browser, decoratorsCollection.toList())
    cleanup(async () => {
      await browser.close()
    })

    /**
     * Test
     */
    const context = await browser.newContext()
    await context.setEncryptedCookie('username', 'virk')

    const page = await context.newPage()
    await page.goto(url)
    assert.equal(await page.inputValue('input[name="cookie"]'), 'virk')
  })

  test('send plain cookie to the server', async ({ assert, cleanup }) => {
    assert.plan(1)

    /**
     * Setup
     */
    const app = await bootApplication('web')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    const encryption = await app.container.make('encryption')

    router.get('/', ({ request }) => {
      return `<html>
        <body>
          <input name="cookie" value="${request.plainCookie('username')}" />
        </body>
      </html>`
    })
    await server.boot()

    const { url } = await createHttpServer(server.handle.bind(server))
    const browser = await chromium.launch()
    extendBrowserClient(new CookieClient(encryption), url)
    decorateBrowser(browser, decoratorsCollection.toList())
    cleanup(async () => {
      await browser.close()
    })

    /**
     * Test
     */
    const context = await browser.newContext()
    await context.setPlainCookie('username', 'virk')

    const page = await context.newPage()
    await page.goto(url)
    assert.equal(await page.inputValue('input[name="cookie"]'), 'virk')
  })

  test('read response cookies', async ({ assert, cleanup }) => {
    /**
     * Setup
     */
    const app = await bootApplication('web')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    const encryption = await app.container.make('encryption')

    router.get('/', ({ response }) => {
      response.cookie('username', 'virk')
      response.encryptedCookie('email', 'foo@bar.com')
      response.plainCookie('id', '1')
    })
    await server.boot()

    const { url } = await createHttpServer(server.handle.bind(server))
    const browser = await chromium.launch()
    extendBrowserClient(new CookieClient(encryption), url)
    decorateBrowser(browser, decoratorsCollection.toList())
    cleanup(async () => {
      await browser.close()
    })

    /**
     * Test
     */
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(url)

    assert.equal(await context.getCookie('username'), 'virk')
    assert.equal(await context.getEncryptedCookie('email'), 'foo@bar.com')
    assert.equal(await context.getPlainCookie('id'), '1')
  })

  test('delete cookies', async ({ assert, cleanup }) => {
    /**
     * Setup
     */
    const app = await bootApplication('web')
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    const encryption = await app.container.make('encryption')

    router.get('/', ({ response }) => {
      response.cookie('username', 'virk')
      response.encryptedCookie('email', 'foo@bar.com')
      response.plainCookie('id', '1')
    })
    await server.boot()

    const { url } = await createHttpServer(server.handle.bind(server))
    const browser = await chromium.launch()
    extendBrowserClient(new CookieClient(encryption), url)
    decorateBrowser(browser, decoratorsCollection.toList())
    cleanup(async () => {
      await browser.close()
    })

    /**
     * Test
     */
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(url)

    await context.clearCookies()

    assert.isNull(await context.getCookie('username'))
    assert.isNull(await context.getEncryptedCookie('email'))
    assert.isNull(await context.getPlainCookie('id'))
  })
})
