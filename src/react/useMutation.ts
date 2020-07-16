import React from 'react'

import { useConfigContext } from './ReactQueryConfigProvider'
import { useGetLatest, useMountedCallback } from './utils'
import { Console, uid, noop } from '../core/utils'
import {
  QueryStatus,
  MutationResultPair,
  MutationFunction,
  MutationConfig,
} from '../core/types'

// TYPES

type Reducer<S, A> = (prevState: S, action: A) => S

interface State<TResult, TError> {
  status: QueryStatus
  data?: TResult
  error: TError | null
}

enum ActionType {
  Reset = 'Reset',
  Loading = 'Loading',
  Resolve = 'Resolve',
  Reject = 'Reject',
}

interface ResetAction {
  type: ActionType.Reset
}

interface LoadingAction {
  type: ActionType.Loading
}

interface ResolveAction<TResult> {
  type: ActionType.Resolve
  data: TResult
}

interface RejectAction<TError> {
  type: ActionType.Reject
  error: TError
}

type Action<TResult, TError> =
  | ResetAction
  | LoadingAction
  | ResolveAction<TResult>
  | RejectAction<TError>

// HOOK

const getDefaultState = (): State<any, any> => ({
  status: QueryStatus.Idle,
  data: undefined,
  error: null,
})

function mutationReducer<TResult, TError>(
  state: State<TResult, TError>,
  action: Action<TResult, TError>
) {
  switch (action.type) {
    case ActionType.Reset:
      return getDefaultState()
    case ActionType.Loading:
      return {
        status: QueryStatus.Loading,
      }
    case ActionType.Resolve:
      return {
        status: QueryStatus.Success,
        data: action.data,
      }
    case ActionType.Reject:
      return {
        status: QueryStatus.Error,
        error: action.error,
      }
    default:
      return state
  }
}

export function useMutation<
  TResult,
  TError = unknown,
  TVariables = undefined,
  TSnapshot = unknown
>(
  mutationFn: MutationFunction<TResult, TVariables>,
  config: MutationConfig<TResult, TError, TVariables, TSnapshot> = {}
): MutationResultPair<TResult, TError, TVariables, TSnapshot> {
  const [state, unsafeDispatch] = React.useReducer(
    mutationReducer as Reducer<State<TResult, TError>, Action<TResult, TError>>,
    null,
    getDefaultState
  )

  const dispatch = useMountedCallback(unsafeDispatch)

  const getMutationFn = useGetLatest(mutationFn)

  const contextConfig = useConfigContext()

  const getConfig = useGetLatest({
    ...contextConfig.shared,
    ...contextConfig.mutations,
    ...config,
  })

  const latestMutationRef = React.useRef<number>()

  const mutate = React.useCallback(
    async (
      variables,
      { onSuccess = noop, onError = noop, onSettled = noop, throwOnError } = {}
    ) => {
      const config = getConfig()

      const mutationId = uid()
      latestMutationRef.current = mutationId

      const isLatest = () => latestMutationRef.current === mutationId

      let snapshotValue

      try {
        dispatch({ type: ActionType.Loading })
        snapshotValue = await config.onMutate!(variables)

        const data = await getMutationFn()(variables)

        if (isLatest()) {
          dispatch({ type: ActionType.Resolve, data })
        }

        await config.onSuccess!(data, variables)
        await onSuccess(data, variables)
        await config.onSettled!(data, null, variables)
        await onSettled(data, null, variables)

        return data
      } catch (error) {
        Console.error(error)
        await config.onError!(error, variables, snapshotValue as TSnapshot)
        await onError(error, variables, snapshotValue)
        await config.onSettled!(
          undefined,
          error,
          variables,
          snapshotValue as TSnapshot
        )
        await onSettled(undefined, error, variables, snapshotValue)

        if (isLatest()) {
          dispatch({ type: ActionType.Reject, error })
        }

        if (throwOnError ?? config.throwOnError) {
          throw error
        }

        return
      }
    },
    [dispatch, getConfig, getMutationFn]
  )

  const reset = React.useCallback(() => dispatch({ type: ActionType.Reset }), [
    dispatch,
  ])

  React.useEffect(() => {
    const { suspense, useErrorBoundary } = getConfig()

    if ((useErrorBoundary ?? suspense) && state.error) {
      throw state.error
    }
  }, [getConfig, state.error])

  return [
    mutate,
    {
      ...state,
      reset,
      isIdle: state.status === QueryStatus.Idle,
      isLoading: state.status === QueryStatus.Loading,
      isSuccess: state.status === QueryStatus.Success,
      isError: state.status === QueryStatus.Error,
    },
  ] as MutationResultPair<TResult, TError, TVariables, TSnapshot>
}
