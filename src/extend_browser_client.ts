/*
 * @japa/plugin-adonisjs
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './extended_types.js'
import { CookieOptions } from 'playwright'
import { Decorator } from '@japa/browser-client'
import { CookieClient } from '@adonisjs/core/http'

/**
 * Normalizes the cookies options to use the default domain
 * and path
 */
function normalizeCookieOptions(defaultDomain?: string, options?: CookieOptions): CookieOptions {
  return Object.assign(
    {
      domain: defaultDomain,
      path: '/',
    },
    options
  )
}

/**
 * Mimicing the behavior of https://github.com/jshttp/cookie/blob/master/index.js
 * package used by AdonisJS to decode response cookies.
 */
function tryDecode(value: string) {
  try {
    return value.indexOf('%') !== -1 ? decodeURIComponent(value) : value
  } catch {
    return value
  }
}

export function extendBrowserClient(cookieClient: CookieClient, baseURL?: string) {
  /**
   * Compute base url from HOST and PORT variables (if exists)
   */
  if (!baseURL) {
    const HOST = process.env.HOST
    const PORT = process.env.PORT
    if (HOST && PORT) {
      baseURL = `http://${HOST}:${PORT}`
    }
  }

  const cookiesDomain = baseURL ? new URL(baseURL).host : undefined

  return {
    context(context) {
      /**
       * Get a signed cookie from the browser context.
       */
      context.getCookie = async function (key) {
        const cookiesList = await this.cookies()
        const cookie = cookiesList.find(({ name }) => name === key)

        if (!cookie) {
          return null
        }

        return cookieClient.unsign(key, tryDecode(cookie.value))
      }

      /**
       * Get an encrypted cookie from the browser context.
       */
      context.getEncryptedCookie = async function (key) {
        const cookiesList = await this.cookies()
        const cookie = cookiesList.find(({ name }) => name === key)

        if (!cookie) {
          return null
        }

        return cookieClient.decrypt(key, tryDecode(cookie.value))
      }

      /**
       * Get a plain cookie from the browser context.
       */
      context.getPlainCookie = async function (key) {
        const cookiesList = await this.cookies()
        const cookie = cookiesList.find(({ name }) => name === key)

        if (!cookie) {
          return null
        }

        return cookieClient.decode(key, tryDecode(cookie.value))
      }

      /**
       * Set a signed cookie on the browser context. Once the cookie is
       * set, all pages inside the given context with have access to
       * it.
       */
      context.setCookie = async function (key, value, options) {
        const signedValue = cookieClient.sign(key, value)

        if (signedValue) {
          await this.addCookies([
            {
              name: key,
              value: signedValue,
              ...normalizeCookieOptions(cookiesDomain, options),
            },
          ])
        }
      }

      /**
       * Set an encrypted cookie on the browser context. Once the cookie is
       * set, all pages inside the given context with have access to
       * it.
       */
      context.setEncryptedCookie = async function (key, value, options) {
        const encryptedValue = cookieClient.encrypt(key, value)
        if (encryptedValue) {
          await this.addCookies([
            {
              name: key,
              value: encryptedValue,
              ...normalizeCookieOptions(cookiesDomain, options),
            },
          ])
        }
      }

      /**
       * Set an encrypted cookie on the browser context. Once the cookie is
       * set, all pages inside the given context with have access to
       * it.
       */
      context.setPlainCookie = async function (key, value, options) {
        const plainCookie = cookieClient.encode(key, value)
        if (plainCookie) {
          await this.addCookies([
            {
              name: key,
              value: plainCookie,
              ...normalizeCookieOptions(cookiesDomain, options),
            },
          ])
        }
      }
    },
  } satisfies Decorator
}
