// components/sample.tsx
"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import useStudyPlannerContract from "@/hooks/useContract"
import { isAddress } from "viem"

const SampleIntegration = () => {
  const { isConnected, address } = useAccount()
  const [title, setTitle] = useState("")
  const [dueDateISO, setDueDateISO] = useState("") // yyyy-mm-dd
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null)

  const { data, actions, state } = useStudyPlannerContract()

  useEffect(() => {
    // optional: refetch on mount if connected
    if (isConnected) {
      actions.refetch().catch((e) => console.error(e))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  const handleAddTask = async () => {
    if (!title) return
    // dueDateISO optional; convert to unix seconds
    const dueUnix = dueDateISO ? Math.floor(new Date(dueDateISO + "T00:00:00Z").getTime() / 1000) : 0
    try {
      await actions.addTask(title, dueUnix)
      setTitle("")
      setDueDateISO("")
    } catch (err) {
      console.error("Add task error:", err)
    }
  }

  const handleMarkCompleted = async (id: number) => {
    try {
      await actions.markCompleted(id)
    } catch (err) {
      console.error("Mark completed error:", err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await actions.deleteTask(id)
    } catch (err) {
      console.error("Delete task error:", err)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-foreground mb-3">Study Planner</h2>
          <p className="text-muted-foreground">Please connect your wallet to interact with the Study Planner contract.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Study Planner</h1>
          <p className="text-muted-foreground text-sm mt-1">Add tasks, mark them complete, and keep your study schedule on-chain.</p>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Your Task Count</p>
            <p className="text-2xl font-semibold text-foreground">{data.myTaskCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Connected Wallet</p>
            <p className="text-sm font-mono text-foreground break-all">{address}</p>
          </div>
        </div>

        {/* Add Task */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-foreground">Add New Task</h3>
            <p className="text-xs text-muted-foreground">Optional due date</p>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title (e.g., Read chapter 3)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <input
              type="date"
              value={dueDateISO}
              onChange={(e) => setDueDateISO(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <button
              onClick={handleAddTask}
              disabled={state.isLoading}
              className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.isLoading ? "Adding..." : "Add Task"}
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {data.tasks.length === 0 ? (
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">No tasks found. Add your first study task above.</p>
            </div>
          ) : (
            data.tasks.map((t) => (
              <div key={t.id} className="p-4 bg-card border border-border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-mono text-foreground">#{t.id}</p>
                    <h4 className={`text-lg font-semibold ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Due: {t.dueDate ? new Date(t.dueDate * 1000).toLocaleDateString() : "No due date"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!t.completed && (
                    <button
                      onClick={() => handleMarkCompleted(t.id)}
                      disabled={state.isLoading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={state.isLoading}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status / Errors */}
        <div className="mt-6">
          {state.hash && (
            <div className="p-4 bg-card border border-border rounded-lg mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Transaction Hash</p>
              <p className="text-sm font-mono text-foreground break-all mb-3">{state.hash}</p>
              {state.isConfirming && <p className="text-sm text-primary">Waiting for confirmation...</p>}
              {state.isConfirmed && <p className="text-sm text-green-500">Transaction confirmed!</p>}
            </div>
          )}

          {state.error && (
            <div className="p-4 bg-card border border-destructive rounded-lg">
              <p className="text-sm text-destructive-foreground">Error: {state.error.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SampleIntegration
