import type { LpSolution, LpSolver } from '../lp/types'
import type { SimplexModel } from '../simplex/types'
import type { BBNode, BBStatus, BBSummary } from './types'

const INT_TOL = 1e-6

const cloneModel = (m: SimplexModel): SimplexModel => ({
  goal: m.goal,
  objective: [...m.objective],
  constraints: m.constraints.map((c) => ({ ...c, coefs: [...c.coefs] })),
  lower: [...m.lower],
  upper: [...m.upper],
})

const snap = (v: number): number => (Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v)
const isInteger = (v: number): boolean => Math.abs(v - Math.round(v)) < INT_TOL

/** Fractional variables with their distance to .5 (0 = exactly halfway = most fractional). */
export function fractionalCandidates(x: number[]): { variable: number; value: number; distance: number }[] {
  return x.flatMap((v, i) =>
    isInteger(v) ? [] : [{ variable: i, value: v, distance: Math.abs(v - Math.floor(v) - 0.5) }],
  )
}

/** Variable closest to .5 (the original app's rule); first one on ties. -1 when all are integer. */
export function pickBranchVariable(x: number[]): number {
  let best = -1
  let bestDist = 1
  for (const c of fractionalCandidates(x))
    if (c.distance < bestDist) {
      bestDist = c.distance
      best = c.variable
    }
  return best
}

/**
 * Branch and Bound for pure integer programs, solved level by level
 * (breadth-first, like the original). The LP relaxations are delegated to an
 * injected {@link LpSolver}, so it runs entirely in the browser.
 */
export class BranchBound {
  readonly nodes = new Map<number, BBNode>()
  /** ids of nodes waiting to have their LP solved, in FIFO order */
  readonly frontier: number[] = []
  /** ids in the order they were solved (what the UI animates) */
  readonly order: number[] = []
  private status: BBStatus = 'running'
  private best: { id: number; z: number; x: number[] } | undefined
  private readonly lp: LpSolver
  private readonly model: SimplexModel
  private readonly maxNodes: number
  private started = false

  constructor(model: SimplexModel, lp: LpSolver, options: { maxNodes?: number } = {}) {
    this.model = cloneModel(model)
    this.lp = lp
    this.maxNodes = options.maxNodes ?? 5000
  }

  get done(): boolean {
    return this.started && (this.status !== 'running' || this.frontier.length === 0 || this.nodes.size >= this.maxNodes)
  }

  /** Solves the root relaxation. Called automatically by the first step(). */
  async start(): Promise<BBNode> {
    this.started = true
    const root: BBNode = {
      id: 1,
      parent: null,
      depth: 0,
      model: cloneModel(this.model),
      status: 'pending',
      optimal: false,
    }
    this.nodes.set(1, root)
    const sol = await this.lp.solve(root.model)
    this.order.push(1)
    if (sol.status === 'unbounded') this.status = 'unbounded'
    this.settle(root, sol)
    return root
  }

  /**
   * Overrides the branching variable of a node that is still waiting in the
   * frontier (what the original app allowed by clicking an x). Returns false if
   * the node can't be re-branched or the variable is already integer there.
   */
  setBranchVariable(id: number, variable: number): boolean {
    const node = this.nodes.get(id)
    if (!node || !this.frontier.includes(id) || !node.x) return false
    if (!node.candidates?.some((c) => c.variable === variable)) return false
    node.branch = { variable, value: node.x[variable], manual: variable !== pickBranchVariable(node.x) }
    return true
  }

  /** Expands the next frontier node: solves both its children. Returns them. */
  async step(): Promise<BBNode[]> {
    if (!this.started) return [await this.start()]
    if (this.done) return []
    const id = this.frontier.shift() as number
    const parent = this.nodes.get(id) as BBNode
    const { variable, value } = parent.branch as { variable: number; value: number }

    const children: BBNode[] = []
    for (const side of ['upper', 'lower'] as const) {
      const model = cloneModel(parent.model)
      const bound = side === 'upper' ? Math.floor(value) : Math.ceil(value)
      model[side][variable] = bound
      const child: BBNode = {
        id: side === 'upper' ? id * 2 : id * 2 + 1,
        parent: id,
        depth: parent.depth + 1,
        model,
        status: 'pending',
        added: { variable, kind: side, value: bound },
        optimal: false,
      }
      this.nodes.set(child.id, child)
      const sol = await this.lp.solve(model)
      this.order.push(child.id)
      this.settle(child, sol)
      children.push(child)
    }
    return children
  }

  async run(): Promise<BBSummary> {
    if (!this.started) await this.start()
    while (!this.done) await this.step()
    return this.summary()
  }

  /** Classifies a solved node and, if needed, queues it for branching. */
  private settle(node: BBNode, sol: LpSolution): void {
    if (sol.status !== 'optimal') {
      node.status = 'infeasible'
      return
    }
    node.z = snap(sol.z)
    node.x = sol.x.map(snap)

    const variable = pickBranchVariable(node.x)
    node.candidates = fractionalCandidates(node.x)
    if (variable === -1) {
      node.status = 'integer'
      node.improved = this.isBetter(node.z)
      if (node.improved) this.best = { id: node.id, z: node.z, x: node.x }
      return
    }
    if (this.best && !this.isBetter(node.z)) {
      node.status = 'pruned'
      node.incumbent = this.best.z
      return
    }
    node.status = 'branched'
    node.branch = { variable, value: node.x[variable] }
    this.frontier.push(node.id)
  }

  /** Strictly better than the incumbent? (ties are not: they can't improve the answer) */
  private isBetter(z: number): boolean {
    if (!this.best) return true
    const gain = this.model.goal === 'max' ? z - this.best.z : this.best.z - z
    return gain > 1e-9
  }

  summary(): BBSummary {
    for (const n of this.nodes.values()) n.optimal = false
    if (this.status === 'unbounded')
      return { status: 'unbounded', z: null, x: null, bestNode: null, nodes: this.nodes.size }
    if (this.frontier.length > 0 && this.nodes.size >= this.maxNodes)
      return { status: 'limit', z: this.best?.z ?? null, x: this.best?.x ?? null, bestNode: this.best?.id ?? null, nodes: this.nodes.size }
    if (!this.done) return { status: 'running', z: this.best?.z ?? null, x: this.best?.x ?? null, bestNode: this.best?.id ?? null, nodes: this.nodes.size }
    if (!this.best) return { status: 'infeasible', z: null, x: null, bestNode: null, nodes: this.nodes.size }
    this.nodes.get(this.best.id)!.optimal = true
    return { status: 'optimal', z: this.best.z, x: this.best.x, bestNode: this.best.id, nodes: this.nodes.size }
  }
}
