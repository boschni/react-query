import { useBaseQuery } from './useBaseQuery'
import { handleSuspense } from './utils'
import {
  QueryConfig,
  QueryResult,
  QueryKey,
  QueryKeyWithoutObject,
  QueryFunction,
} from '../core/types'
import { useQueryArgs } from './useQueryArgs'

// TYPES

export interface UseQueryObjectConfig<TResult, TError> {
  queryKey: QueryKey
  queryFn?: QueryFunction<TResult>
  config?: QueryConfig<TResult, TError>
}

// HOOK

// Parameter syntax with optional config
export function useQuery<TResult, TError = unknown>(
  queryKey: QueryKeyWithoutObject,
  queryConfig?: QueryConfig<TResult, TError>
): QueryResult<TResult, TError>

// Parameter syntax with query function and optional config
export function useQuery<TResult, TError = unknown>(
  queryKey: QueryKeyWithoutObject,
  queryFn: QueryFunction<TResult>,
  queryConfig?: QueryConfig<TResult, TError>
): QueryResult<TResult, TError>

// Object syntax
export function useQuery<TResult, TError = unknown>(
  config: UseQueryObjectConfig<TResult, TError>
): QueryResult<TResult, TError>

// Implementation
export function useQuery<TResult, TError = unknown>(
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
