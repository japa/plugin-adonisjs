/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Cookie } from 'playwright'
import type {
  RoutesList,
  URLOptions,
  LookupList,
  GetRoutesForMethod,
  RouteBuilderArguments,
} from '@adonisjs/core/types/http'

declare module '@japa/runner/core' {
  /**
   * Extended TestContext interface with AdonisJS-specific methods.
   *
   * This interface extends the base TestContext from Japa with AdonisJS utilities
   * for route URL generation and REPL access during tests.
   */
  export interface TestContext {
    /**
     * Creates a URL for a pre-registered route using AdonisJS router.
     *
     * This method generates URLs for named routes defined in the AdonisJS application.
     * It supports type-safe route parameters and query string options.
     *
     * @param args - Route identifier and optional parameters/options
     *
     * @example
     * ```js
     * const url = test.route('users.show', { id: 1 })
     * ```
     */
    route<Identifier extends keyof GetRoutesForMethod<RoutesList, 'GET'> & string>(
      ...args: RoutesList extends LookupList
        ? RouteBuilderArguments<Identifier, RoutesList['GET'][Identifier], URLOptions>
        : []
    ): string

    /**
     * REPL utilities for interactive debugging during tests.
     */
    repl: {
      /**
       * Starts the AdonisJS REPL during test execution.
       *
       * This method allows interactive debugging by starting a REPL session
       * with access to the application context and test environment.
       *
       * @param context - Optional context object to make available in the REPL
       *
       * @example
       * ```js
       * await test.repl.start({ user: currentUser })
       * ```
       */
      start(context?: Record<any, any>): Promise<void>
    }
  }
}

declare module '@japa/api-client' {
  /**
   * Extended ApiRequest interface with AdonisJS cookie methods.
   *
   * This interface extends the base ApiRequest from @japa/api-client with
   * AdonisJS-specific cookie handling methods for signed, encrypted, and plain cookies.
   */
  export interface ApiRequest {
    /**
     * Sends a signed cookie during the API request.
     *
     * @deprecated Use withCookie instead
     * @see withCookie
     *
     * @param key - The cookie name
     * @param value - The cookie value to sign and send
     */
    cookie(key: string, value: any): this

    /**
     * Sends a signed cookie during the API request.
     *
     * This method signs the cookie value using AdonisJS cookie client
     * and includes it in the request headers.
     *
     * @param key - The cookie name
     * @param value - The cookie value to sign and send
     *
     * @example
     * ```js
     * client.get('/dashboard').withCookie('user_id', 123)
     * ```
     */
    withCookie(key: string, value: any): this

    /**
     * Sends an encrypted cookie during the API request.
     *
     * @deprecated Use withEncryptedCookie instead
     * @see withEncryptedCookie
     *
     * @param key - The cookie name
     * @param value - The cookie value to encrypt and send
     */
    encryptedCookie(key: string, value: any): this

    /**
     * Sends an encrypted cookie during the API request.
     *
     * This method encrypts the cookie value using AdonisJS cookie client
     * and includes it in the request headers.
     *
     * @param key - The cookie name
     * @param value - The cookie value to encrypt and send
     *
     * @example
     * ```js
     * client.post('/login').withEncryptedCookie('session_data', sessionInfo)
     * ```
     */
    withEncryptedCookie(key: string, value: any): this

    /**
     * Sends a plain cookie during the API request.
     *
     * @deprecated Use withPlainCookie instead
     * @see withPlainCookie
     *
     * @param key - The cookie name
     * @param value - The plain cookie value to send
     */
    plainCookie(key: string, value: any): this

    /**
     * Sends a plain cookie during the API request.
     *
     * This method encodes the cookie value without signing or encryption
     * and includes it in the request headers.
     *
     * @param key - The cookie name
     * @param value - The plain cookie value to send
     *
     * @example
     * ```js
     * client.get('/preferences').withPlainCookie('theme', 'dark')
     * ```
     */
    withPlainCookie(key: string, value: any): this
  }
}

declare module 'playwright' {
  /**
   * Cookie options type for Playwright browser context cookie operations.
   *
   * This type represents optional cookie settings excluding the required
   * name and value fields, used when setting cookies in browser contexts.
   */
  export type CookieOptions = Partial<Omit<Cookie, 'name' | 'value'>>

  /**
   * Extended BrowserContext interface with AdonisJS cookie methods.
   *
   * This interface extends Playwright's BrowserContext with AdonisJS-specific
   * cookie handling methods for getting and setting signed, encrypted, and plain cookies.
   */
  export interface BrowserContext {
    /**
     * Gets a signed cookie from the browser context.
     *
     * This method retrieves and unsigns a cookie value using the AdonisJS
     * cookie client, returning the original value.
     *
     * @param key - The cookie name to retrieve
     *
     * @example
     * ```js
     * const userId = await context.getCookie('user_id')
     * ```
     */
    getCookie(key: string): Promise<any>

    /**
     * Gets an encrypted cookie from the browser context.
     *
     * This method retrieves and decrypts a cookie value using the AdonisJS
     * cookie client, returning the original value.
     *
     * @param key - The cookie name to retrieve
     *
     * @example
     * ```js
     * const sessionData = await context.getEncryptedCookie('session')
     * ```
     */
    getEncryptedCookie(key: string): Promise<any>

    /**
     * Gets a plain cookie from the browser context.
     *
     * This method retrieves and decodes a plain cookie value using the AdonisJS
     * cookie client.
     *
     * @param key - The cookie name to retrieve
     *
     * @example
     * ```js
     * const theme = await context.getPlainCookie('theme')
     * ```
     */
    getPlainCookie(key: string): Promise<any>

    /**
     * Sets a signed cookie on the browser context.
     *
     * This method signs the cookie value using the AdonisJS cookie client
     * and sets it on the browser context. All pages within the context
     * will have access to this cookie.
     *
     * @param key - The cookie name
     * @param value - The cookie value to sign and set
     * @param options - Optional cookie settings (domain, path, etc.)
     *
     * @example
     * ```js
     * await context.setCookie('user_id', 123, { httpOnly: true })
     * ```
     */
    setCookie(key: string, value: any, options?: CookieOptions): Promise<void>

    /**
     * Sets an encrypted cookie on the browser context.
     *
     * This method encrypts the cookie value using the AdonisJS cookie client
     * and sets it on the browser context. All pages within the context
     * will have access to this cookie.
     *
     * @param key - The cookie name
     * @param value - The cookie value to encrypt and set
     * @param options - Optional cookie settings (domain, path, etc.)
     *
     * @example
     * ```js
     * await context.setEncryptedCookie('session_data', sessionInfo)
     * ```
     */
    setEncryptedCookie(key: string, value: any, options?: CookieOptions): Promise<void>

    /**
     * Sets a plain cookie on the browser context.
     *
     * This method encodes the cookie value without signing or encryption
     * and sets it on the browser context. All pages within the context
     * will have access to this cookie.
     *
     * @param key - The cookie name
     * @param value - The plain cookie value to set
     * @param options - Optional cookie settings (domain, path, etc.)
     *
     * @example
     * ```js
     * await context.setPlainCookie('theme', 'dark', { path: '/dashboard' })
     * ```
     */
    setPlainCookie(key: string, value: any, options?: CookieOptions): Promise<void>
  }
}
