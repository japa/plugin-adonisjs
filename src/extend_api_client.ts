/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type CookieClient } from '@adonisjs/core/http'
import { ApiClient, ApiRequest } from '@japa/api-client'

import './types/extended.js'
import debug from './debug.ts'

/**
 * Extends the "@japa/api-client" plugin with AdonisJS-specific cookie methods.
 *
 * This function adds custom methods to the ApiClient for handling signed, encrypted,
 * and plain cookies. It also sets up a cookie serializer to properly parse response
 * cookies using the AdonisJS cookie client.
 *
 * @param cookieClient - The AdonisJS cookie client instance for cookie operations
 *
 * @example
 * ```js
 * extendApiClient(app.container.use('cookie'))
 * ```
 */
export function extendApiClient(cookieClient: CookieClient) {
  debug('extending @japa/api-client with adonisjs specific methods')

  /**
   * Cookie serializer for handling AdonisJS cookies in API responses.
   *
   * Sets up methods to prepare cookies for requests and process cookies from responses.
   * The prepare method returns values as-is since encryption/signing happens in the macro methods.
   * The process method uses the AdonisJS cookie client to parse signed/encrypted cookies.
   */
  ApiClient.cookiesSerializer({
    /**
     * Prepares cookie values for outgoing requests.
     *
     * Returns the value as-is since cookie encryption and signing is handled
     * by the macro methods before reaching this serializer.
     *
     * @param _ - Cookie key (unused)
     * @param value - Cookie value to prepare
     */
    prepare(_: string, value: any) {
      return value
    },

    /**
     * Processes cookies from server responses.
     *
     * Uses the AdonisJS cookie client to parse signed/encrypted cookies
     * from server responses back to their original values.
     *
     * @param key - The cookie name
     * @param value - The raw cookie value from server response
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
