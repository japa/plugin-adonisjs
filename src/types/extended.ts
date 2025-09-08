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
  export interface TestContext {
    /**
     * Create URL for a pre-registered route
     */
    route<Identifier extends keyof GetRoutesForMethod<RoutesList, 'GET'> & string>(
      ...args: RoutesList extends LookupList
        ? RouteBuilderArguments<Identifier, RoutesList['GET'][Identifier], URLOptions>
        : []
    ): string

    repl: {
      /**
       * Start AdonisJS repl during the test
       */
      start(context?: Record<any, any>): Promise<void>
    }
  }
}

declare module '@japa/api-client' {
  export interface ApiRequest {
    /**
     * Send a signed cookie during the API request
     * @deprecated
     * @see withCookie
     */
    cookie(key: string, value: any): this

    /**
     * Send a signed cookie during the API request
     */
    withCookie(key: string, value: any): this

    /**
     * Send an encrypted cookie during the API request
     * @deprecated
     * @see withEncryptedCookie
     */
    encryptedCookie(key: string, value: any): this

    /**
     * Send an encrypted cookie during the API request
     */
    withEncryptedCookie(key: string, value: any): this

    /**
     * Send a plain cookie during the API request
     * @deprecated
     * @see withPlainCookie
     */
    plainCookie(key: string, value: any): this

    /**
     * Send a plain cookie during the API request
     */
    withPlainCookie(key: string, value: any): this
  }
}

declare module 'playwright' {
  export type CookieOptions = Partial<Omit<Cookie, 'name' | 'value'>>

  export interface BrowserContext {
    /**
     * Get a signed cookie from the browser context.
     */
    getCookie(key: string): Promise<any>

    /**
     * Get an encrypted cookie from the browser context.
     */
    getEncryptedCookie(key: string): Promise<any>

    /**
     * Get a plain cookie from the browser context.
     */
    getPlainCookie(key: string): Promise<any>

    /**
     * Set a signed cookie on the browser context. Once the cookie is
     * set, all pages inside the given context with have access to
     * it.
     */
    setCookie(key: string, value: any, options?: CookieOptions): Promise<void>

    /**
     * Set an encrypted cookie on the browser context. Once the cookie is
     * set, all pages inside the given context with have access to
     * it.
     */
    setEncryptedCookie(key: string, value: any, options?: CookieOptions): Promise<void>

    /**
     * Set a plain cookie on the browser context. Once the cookie is
     * set, all pages inside the given context with have access to
     * it.
     */
    setPlainCookie(key: string, value: any, options?: CookieOptions): Promise<void>
  }
}
