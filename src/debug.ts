/*
 * @japa/plugin-adonisjs
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debuglog } from 'node:util'

/**
 * Debug logger for the japa:plugin-adonisjs namespace.
 *
 * This logger is used to output debug information when the NODE_DEBUG environment
 * variable includes 'japa:plugin-adonisjs'.
 *
 * @example
 * ```js
 * debug('extending @japa/api-client with adonisjs specific methods')
 * ```
 */
export default debuglog('japa:plugin-adonisjs')
