import { useBaseQuery } from './useBaseQuery'
import { handleSuspense } from './utils'
import {
  QueryKey,
  QueryKeyWithoutObject,
  InfiniteQueryConfig,
  InfiniteQueryResult,
  QueryFunction,
} from '../core/types'
import { useQueryArgs } from './useQueryArgs'

// TYPES

export interface UseInfiniteQueryObjectConfig<TResult, TError> {
  queryKey: QueryKey
  queryFn?: QueryFunction<TResult>
  config: InfiniteQueryConfig<TResult, TError>
}

// HOOK

// Parameter syntax with config
export function useInfiniteQuery<TResult, TError = unknown>(
  queryKey: QueryKeyWithoutObject,
  queryConfig: InfiniteQueryConfig<TResult, TError>
): InfiniteQueryResult<TResult, TError>

// Parameter syntax with query function and config
export function useInfiniteQuery<TResult, TError = unknown>(
  queryKey: QueryKeyWithoutObject,
  queryFn: QueryFunction<TResult>,
  queryConfig: InfiniteQueryConfig<TResult, TError>
): InfiniteQueryResult<TResult, TError>

// Object syntax
export function useInfiniteQuery<TResult, TError = unknown>(
  config: UseInfiniteQueryObjectConfig<TResult, TError>
): InfiniteQueryResult<TResult, TError>

// Implementation
export function useInfiniteQuery<TResult, TError = unknown>(
  ...args: any[]
): InfiniteQueryResult<TResult, TError> {
  const [queryKey, config] = useQueryArgs<TResult[], TError>(args)

  config.infinite = true

  const result = useBaseQuery<TResult[], TError>(queryKey, config)
  const query = result.query
  const state = result.query.state

  handleSuspense(result)

  return {
    ...result,
    data: state.data,
    canFetchMore: state.canFetchMore,
    fetchMore: query.fetchMore,
    isFetching: state.isFetching,
    isFetchingMore: state.isFetchingMore,
  }
}
