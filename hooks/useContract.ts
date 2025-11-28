// hooks/useContract.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import { formatEther } from "viem"
import { contractABI, contractAddress } from "@/lib/contract"

export interface TaskData {
  id: number
  title: string
  dueDate: number // unix seconds
  completed: boolean
  exists: boolean
}

export interface ContractData {
  myTaskCount: number
  tasks: TaskData[]
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: `0x${string}` | undefined
  error: Error | null
}

export interface ContractActions {
  addTask: (title: string, dueDateUnixSeconds: number) => Promise<void>
  markCompleted: (id: number) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  refetch: () => Promise<void>
}

export const useStudyPlannerContract = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Read my task count
  const { data: rawTaskCount, refetch: refetchTaskCount } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getMyTaskCount",
    query: {
      enabled: !!address,
    },
  })

  // Read my tasks
  const { data: rawTasks, refetch: refetchTasks } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getMyTasks",
    query: {
      enabled: !!address,
    },
  })

  // Write contract
  const { writeContractAsync, data: hash, error: writeError, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // map rawTasks -> TaskData
  const transformTasks = useCallback((raw: any): TaskData[] => {
    if (!raw || !Array.isArray(raw)) return []
    return raw.map((t: any) => {
      const id = Number(t.id ?? t[0])
      const title = String(t.title ?? t[1] ?? "")
      const dueDate = Number(t.dueDate ?? t[2] ?? 0)
      const completed = Boolean(t.completed ?? t[3])
      const exists = Boolean(t.exists ?? t[4] ?? true)
      return { id, title, dueDate, completed, exists }
    })
  }, [])

  useEffect(() => {
    if (rawTasks) {
      try {
        const mapped = transformTasks(rawTasks as any)
        setTasks(mapped)
      } catch (err: any) {
        console.error("Error mapping tasks:", err)
        setError(err)
      }
    } else {
      setTasks([])
    }
  }, [rawTasks, transformTasks])

  useEffect(() => {
    if (isConfirmed) {
      // after tx confirmed, refetch on-chain data
      refetchTaskCount()
      refetchTasks()
    }
  }, [isConfirmed, refetchTaskCount, refetchTasks])

  useEffect(() => {
    if (writeError && !error) {
      setError(writeError as Error)
    }
  }, [writeError, error])

  const addTask = async (title: string, dueDateUnixSeconds: number) => {
    if (!title) return
    try {
      setIsLoading(true)
      setError(null)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "addTask",
        args: [title, BigInt(dueDateUnixSeconds)],
      })
      // do not await refetch here — wait for confirmation effect to trigger refetch
    } catch (err: any) {
      console.error("Error adding task:", err)
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const markCompleted = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "markCompleted",
        args: [BigInt(id)],
      })
    } catch (err: any) {
      console.error("Error marking completed:", err)
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTask = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "deleteTask",
        args: [BigInt(id)],
      })
    } catch (err: any) {
      console.error("Error deleting task:", err)
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await Promise.all([refetchTaskCount(), refetchTasks()])
  }

  const data: ContractData = {
    myTaskCount: rawTaskCount ? Number(rawTaskCount as bigint) : tasks.length,
    tasks,
  }

  const actions: ContractActions = {
    addTask,
    markCompleted,
    deleteTask,
    refetch,
  }

  const state: ContractState = {
    isLoading: isLoading || isPending || isConfirming,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  }

  return {
    data,
    actions,
    state,
  }
}

export default useStudyPlannerContract
