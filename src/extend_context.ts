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

export function extendContext(router: Router) {
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
