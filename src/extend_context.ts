/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './extended_types.js'
import { TestContext } from '@japa/runner'
import type { Router } from '@adonisjs/core/http'
import type { MakeUrlOptions } from '@adonisjs/core/types/http'

import debug from './debug.js'

export function extendContext(router: Router) {
  debug('extending japa context with adonisjs specific methods')

  TestContext.macro(
    'route',
    function (
      routeIdentifier: string,
      params?: any[] | Record<string, any>,
      options?: MakeUrlOptions
    ) {
      return router.makeUrl(routeIdentifier, params, options)
    }
  )
}
