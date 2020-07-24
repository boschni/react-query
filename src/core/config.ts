import { noop, stableStringify, identity, deepEqual } from './utils'
import {
  ArrayQueryKey,
  QueryKey,
  QueryKeySerializerFunction,
  ReactQueryConfig,
} from './types'

// TYPES

export interface ReactQueryConfigRef {
  current: ReactQueryConfig
}

// CONFIG

export const defaultQueryKeySerializerFn: QueryKeySerializerFunction = (
  queryKey: QueryKey
): [string, ArrayQueryKey] => {
  try {
    let arrayQueryKey: ArrayQueryKey = Array.isArray(queryKey)
      ? ((queryKey as unknown) as ArrayQueryKey)
      : [queryKey]
    const queryHash = stableStringify(arrayQueryKey)
    arrayQueryKey = JSON.parse(queryHash)
    return [queryHash, arrayQueryKey]
  } catch {
    throw new Error('A valid query key is required!')
  }
}

export const DEFAULT_CONFIG: ReactQueryConfig = {
  shared: {
    suspense: false,
  },
  queries: {
    queryKeySerializerFn: defaultQueryKeySerializerFn,
    queryFn: undefined,
    initialStale: undefined,
    enabled: true,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    queryFnParamsFilter: identity,
    refetchOnMount: true,
    isDataEqual: deepEqual,
    onError: noop,
    onSuccess: noop,
    onSettled: noop,
    useErrorBoundary: false,
  },
  mutations: {
    throwOnError: false,
    onMutate: noop,
    onError: noop,
    onSuccess: noop,
    onSettled: noop,
    useErrorBoundary: false,
  },
}

export const defaultConfigRef: ReactQueryConfigRef = {
  current: DEFAULT_CONFIG,
}
