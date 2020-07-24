import React from 'react'

import { useBaseQuery } from './useBaseQuery'
import { handleSuspense } from './utils'
import { getStatusBools } from '../core/utils'
import {
  QueryKey,
  PaginatedQueryResult,
  PaginatedQueryConfig,
  QueryFunction,
  QueryStatus,
  SingularQueryKeyWithoutObject,
  ArrayQueryKey,
  SingularQueryKey,
} from '../core/types'
import { useQueryArgs } from './useQueryArgs'

// A paginated query is more like a "lag" query, which means
// as the query key changes, we keep the results from the
// last query and use them as placeholder data in the next one
// We DON'T use it as initial data though. That's important

// TYPES

export interface SingularUsePaginatedQueryObjectConfig<
  TResult,
  TError,
  TKey extends SingularQueryKey
> {
  queryKey: QueryKey
  queryFn?: QueryFunction<TResult, [TKey]>
  config?: PaginatedQueryConfig<TResult, TError>
}

export interface UsePaginatedQueryObjectConfig<
  TResult,
  TError,
  TKey extends ArrayQueryKey
> {
  queryKey: QueryKey
  queryFn?: QueryFunction<TResult, TKey>
  config?: PaginatedQueryConfig<TResult, TError>
}

// HOOK

// Parameter syntax with optional config
export function usePaginatedQuery<
  TResult,
  TError,
  TKey extends SingularQueryKeyWithoutObject
>(
  queryKey: TKey,
  queryConfig?: PaginatedQueryConfig<TResult, TError>
): PaginatedQueryResult<TResult, TError>

// Parameter syntax with query function and optional config
export function usePaginatedQuery<
  TResult,
  TError,
  TKey extends SingularQueryKeyWithoutObject
>(
  queryKey: TKey,
  queryFn: QueryFunction<TResult, [TKey]>,
  queryConfig?: PaginatedQueryConfig<TResult, TError>
): PaginatedQueryResult<TResult, TError>

export function usePaginatedQuery<TResult, TError, TKey extends ArrayQueryKey>(
  queryKey: TKey,
  queryFn: QueryFunction<TResult, TKey>,
  queryConfig?: PaginatedQueryConfig<TResult, TError>
): PaginatedQueryResult<TResult, TError>

// Object syntax
export function usePaginatedQuery<
  TResult,
  TError,
  TKey extends SingularQueryKey
>(
  config: SingularUsePaginatedQueryObjectConfig<TResult, TError, TKey>
): PaginatedQueryResult<TResult, TError>

export function usePaginatedQuery<TResult, TError, TKey extends ArrayQueryKey>(
  config: UsePaginatedQueryObjectConfig<TResult, TError, TKey>
): PaginatedQueryResult<TResult, TError>

// Implementation
export function usePaginatedQuery<TResult, TError>(
  ...args: any[]
): PaginatedQueryResult<TResult, TError> {
  const [queryKey, config = {}] = useQueryArgs<TResult, TError>(args)

  // Keep track of the latest data result
  const lastDataRef = React.useRef<TResult>()

  // If latestData is there, don't use initialData
  if (typeof lastDataRef.current !== 'undefined') {
    delete config.initialData
  }

  // Make the query as normal
  const result = useBaseQuery<TResult, TError>(queryKey, config)

  // If the query is disabled, get rid of the latest data
  if (!result.query.config.enabled) {
    lastDataRef.current = undefined
  }

  // Get the real data and status from the query
  const { data: latestData, status } = result.query.state

  // If the real query succeeds, and there is data in it,
  // update the latest data
  React.useEffect(() => {
    if (status === 'success' && typeof latestData !== 'undefined') {
      lastDataRef.current = latestData
    }
  }, [latestData, status])

  // Resolved data should be either the real data we're waiting on
  // or the latest placeholder data
  let resolvedData = latestData
  if (typeof resolvedData === 'undefined') {
    resolvedData = lastDataRef.current
  }

  // If we have any data at all from either, we
  // need to make sure the status is success, even though
  // the real query may still be loading
  if (typeof resolvedData !== 'undefined') {
    const overrides = {
      status: 'success',
      ...getStatusBools(QueryStatus.Success),
    }
    Object.assign(result.query.state, overrides)
    Object.assign(result, overrides)
  }

  handleSuspense(result)

  return {
    ...result,
    resolvedData,
    latestData,
  }
}
