import { useBaseQuery } from './useBaseQuery'
import { handleSuspense } from './utils'
import {
  QueryConfig,
  QueryResult,
  QueryKey,
  QueryKeyWithoutObject,
  QueryFunction,
  ArrayQueryKey,
  SingularQueryKeyWithoutObject,
} from '../core/types'
import { useQueryArgs } from './useQueryArgs'

// TYPES

export interface UseSingularQueryObjectConfig<
  TResult,
  TError,
  TKey extends SingularQueryKeyWithoutObject
> {
  queryKey: QueryKey
  queryFn?: QueryFunction<TResult, [TKey]>
  config?: QueryConfig<TResult, TError>
}

export interface UseQueryObjectConfig<
  TResult,
  TError,
  TKey extends ArrayQueryKey
> {
  queryKey: QueryKey
  queryFn?: QueryFunction<TResult, TKey>
  config?: QueryConfig<TResult, TError>
}

// HOOK

// Parameter syntax with optional config
export function useQuery<TResult, TError>(
  queryKey: QueryKeyWithoutObject,
  queryConfig?: QueryConfig<TResult, TError>
): QueryResult<TResult, TError>

// Parameter syntax with query function and optional config
export function useQuery<
  TResult,
  TError,
  TKey extends SingularQueryKeyWithoutObject
>(
  queryKey: TKey,
  queryFn: QueryFunction<TResult, [TKey]>,
  queryConfig?: QueryConfig<TResult, TError>
): QueryResult<TResult, TError>

// Parameter syntax with query function and optional config
export function useQuery<TResult, TError, TKey extends ArrayQueryKey>(
  queryKey: TKey,
  queryFn: QueryFunction<TResult, TKey>,
  queryConfig?: QueryConfig<TResult, TError>
): QueryResult<TResult, TError>

// Object syntax
export function useQuery<
  TResult,
  TError,
  TKey extends SingularQueryKeyWithoutObject
>(
  config: UseSingularQueryObjectConfig<TResult, TError, TKey>
): QueryResult<TResult, TError>

export function useQuery<TResult, TError, TKey extends ArrayQueryKey>(
  config: UseQueryObjectConfig<TResult, TError, TKey>
): QueryResult<TResult, TError>

// Implementation
export function useQuery<TResult, TError>(
  ...args: any[]
): QueryResult<TResult, TError> {
  const [queryKey, config = {}] = useQueryArgs<TResult, TError>(args)
  const result = useBaseQuery<TResult, TError>(queryKey, config)
  const state = result.query.state

  handleSuspense(result)

  return {
    ...result,
    data: state.data,
  }
}
