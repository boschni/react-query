import { useBaseQuery } from './useBaseQuery'
import { handleSuspense } from './utils'
import {
  QueryKey,
  InfiniteQueryConfig,
  InfiniteQueryResult,
  QueryFunction,
  SingularQueryKeyWithoutObject,
  ArrayQueryKey,
  SingularQueryKey,
} from '../core/types'
import { useQueryArgs } from './useQueryArgs'

// TYPES

export interface SingularUseInfiniteQueryObjectConfig<
  TResult,
  TError,
  TKey extends SingularQueryKey
> {
  queryKey: QueryKey
  queryFn?: QueryFunction<TResult, [TKey]>
  config?: InfiniteQueryConfig<TResult, TError>
}

export interface UseInfiniteQueryObjectConfig<
  TResult,
  TError,
  TKey extends ArrayQueryKey
> {
  queryKey: QueryKey
  queryFn?: QueryFunction<TResult, TKey>
  config?: InfiniteQueryConfig<TResult, TError>
}

// HOOK

// Parameter syntax with optional config
export function useInfiniteQuery<
  TResult,
  TError,
  TKey extends SingularQueryKeyWithoutObject
>(
  queryKey: TKey,
  queryConfig?: InfiniteQueryConfig<TResult, TError>
): InfiniteQueryResult<TResult, TError>

// Parameter syntax with query function and optional config
export function useInfiniteQuery<
  TResult,
  TError,
  TKey extends SingularQueryKeyWithoutObject
>(
  queryKey: TKey,
  queryFn: QueryFunction<TResult, [TKey]>,
  queryConfig?: InfiniteQueryConfig<TResult, TError>
): InfiniteQueryResult<TResult, TError>

export function useInfiniteQuery<TResult, TError, TKey extends ArrayQueryKey>(
  queryKey: TKey,
  queryFn: QueryFunction<TResult, TKey>,
  queryConfig?: InfiniteQueryConfig<TResult, TError>
): InfiniteQueryResult<TResult, TError>

// Object syntax
export function useInfiniteQuery<
  TResult,
  TError,
  TKey extends SingularQueryKey
>(
  config: SingularUseInfiniteQueryObjectConfig<TResult, TError, TKey>
): InfiniteQueryResult<TResult, TError>

export function useInfiniteQuery<TResult, TError, TKey extends ArrayQueryKey>(
  config: UseInfiniteQueryObjectConfig<TResult, TError, TKey>
): InfiniteQueryResult<TResult, TError>

// Implementation
export function useInfiniteQuery<TResult, TError>(
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
