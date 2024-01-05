/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './types/extended.js'
import { CookieClient } from '@adonisjs/core/http'
import { ApiClient, ApiRequest } from '@japa/api-client'

import debug from './debug.js'

/**
 * Extending the "@japa/api-client" plugin with custom methods to
 * set cookies, session, csrf token and authenticated user.
 */
export function extendApiClient(cookieClient: CookieClient) {
  debug('extending @japa/api-client with adonisjs specific methods')

  /**
   * Serializer for parsing response cookies
   */
  ApiClient.cookiesSerializer({
    /**
     * The methods on the Request class encrypts and signs cookies.
     * Therefore, the prepare method returns the value as it is
     */
    prepare(_: string, value: any) {
      return value
    },

    /**
     * Process the server response and convert cookie value to a
     * plain string
     */
    process(key: string, value: any) {
      if (!value) {
        return value
      }
      return cookieClient.parse(key, value)
    },
  })

  /**
   * Send a signed cookie during the API request
   */
  ApiRequest.macro('withCookie', function (this: ApiRequest, key: string, value: any) {
    const signedValue = cookieClient.sign(key, value)
    if (signedValue) {
      this.cookiesJar[key] = { name: key, value: signedValue }
    }

    return this
  })
  ApiRequest.macro('cookie', function (this: ApiRequest, key: string, value: any) {
    return this.withCookie(key, value)
  })

  /**
   * Send an encrypted cookie during the API request
   */
  ApiRequest.macro('withEncryptedCookie', function (this: ApiRequest, key: string, value: any) {
    const encryptedValue = cookieClient.encrypt(key, value)
    if (encryptedValue) {
      this.cookiesJar[key] = { name: key, value: encryptedValue }
    }

    return this
  })

  ApiRequest.macro('encryptedCookie', function (this: ApiRequest, key: string, value: any) {
    return this.withEncryptedCookie(key, value)
  })

  /**
   * Send an encrypted cookie during the API request
   */
  ApiRequest.macro('withPlainCookie', function (this: ApiRequest, key: string, value: any) {
    const plainValue = cookieClient.encode(key, value)
    if (plainValue) {
      this.cookiesJar[key] = { name: key, value: plainValue }
    }

    return this
  })

  ApiRequest.macro('plainCookie', function (this: ApiRequest, key: string, value: any) {
    return this.withPlainCookie(key, value)
  })
}
