import type { WorkflowRun, WorkflowStep } from "./workflow-types"

type RunStatus = WorkflowRun["status"]

interface ActiveRun {
  id: string
  workflowSlug: string
  status: RunStatus
  startedAt: string
  completedAt?: string
  currentStep: number
  totalSteps: number
  steps: WorkflowStep[]
}

function generateId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 8)
  return `wf_${ts}_${rand}`
}

const activeRuns = new Map<string, ActiveRun>()

function createInitialSteps(steps: string[]): WorkflowStep[] {
  return steps.map((slug, i) => ({
    id: `step_${i + 1}_${generateId()}`,
    name: slug
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug,
    status: "pending" as const,
    progress: 0,
  }))
}

export function createWorkflowRunner(workflowSlug: string) {
  const runId = generateId()

  const run: ActiveRun = {
    id: runId,
    workflowSlug,
    status: "pending",
    startedAt: new Date().toISOString(),
    currentStep: 0,
    totalSteps: 0,
    steps: [],
  }

  let runResolve: (value: ActiveRun) => void
  let runReject: (reason: unknown) => void

  const runPromise = new Promise<ActiveRun>((resolve, reject) => {
    runResolve = resolve
    runReject = reject
  })

  const timeout = setTimeout(() => {
    run.status = "failed"
    run.completedAt = new Date().toISOString()
    runReject(new Error("Workflow timed out"))
  }, 300_000)

  const runner = {
    runId,
    promise: runPromise,
    initializeSteps(steps: string[]) {
      run.totalSteps = steps.length
      run.steps = createInitialSteps(steps)
      run.status = "running"
      activeRuns.set(runId, run)
    },
    startStep(index: number) {
      run.currentStep = index
      if (run.steps[index]) {
        run.steps[index].status = "running"
        run.steps[index].startedAt = new Date().toISOString()
      }
      activeRuns.set(runId, run)
    },
    completeStep(index: number, result?: unknown) {
      if (run.steps[index]) {
        run.steps[index].status = "completed"
        run.steps[index].completedAt = new Date().toISOString()
        run.steps[index].progress = 100
        run.steps[index].result = result
      }
      activeRuns.set(runId, run)
    },
    failStep(index: number, error: string) {
      if (run.steps[index]) {
        run.steps[index].status = "failed"
        run.steps[index].completedAt = new Date().toISOString()
        run.steps[index].error = error
      }
      activeRuns.set(runId, run)
    },
    skipStep(index: number) {
      if (run.steps[index]) {
        run.steps[index].status = "skipped"
        run.steps[index].completedAt = new Date().toISOString()
        run.steps[index].progress = 0
      }
      activeRuns.set(runId, run)
    },
    updateProgress(index: number, progress: number) {
      if (run.steps[index]) {
        run.steps[index].progress = Math.min(100, Math.max(0, progress))
      }
      activeRuns.set(runId, run)
    },
    complete() {
      clearTimeout(timeout)
      run.status = "completed"
      run.completedAt = new Date().toISOString()
      activeRuns.set(runId, run)
      runResolve(run)
    },
    fail(error: string) {
      clearTimeout(timeout)
      run.status = "failed"
      run.completedAt = new Date().toISOString()
      run.steps.forEach((s) => {
        if (s.status === "running") {
          s.status = "failed"
          s.error = error
        }
      })
      activeRuns.set(runId, run)
      runReject(new Error(error))
    },
    cancel() {
      clearTimeout(timeout)
      run.status = "cancelled"
      run.completedAt = new Date().toISOString()
      run.steps.forEach((s) => {
        if (s.status === "running") {
          s.status = "skipped"
        }
      })
      activeRuns.set(runId, run)
      runResolve(run)
    },
    getState(): ActiveRun {
      return { ...run }
    },
  }

  activeRuns.set(runId, run)

  return runner
}

export async function trackWorkflowRun(runId: string): Promise<WorkflowRun | null> {
  const run = activeRuns.get(runId)
  if (!run) return null

  return {
    id: run.id,
    workflowSlug: run.workflowSlug,
    userId: null,
    guestId: null,
    status: run.status,
    inputData: {},
    outputData: {},
    steps: run.steps,
    currentStep: run.currentStep,
    totalSteps: run.totalSteps,
    creditsUsed: 0,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
  }
}

export function cleanupWorkflowRun(runId: string): void {
  activeRuns.delete(runId)
}
