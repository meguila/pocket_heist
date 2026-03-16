import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import { Heist } from "@/types/firestore"

vi.mock("@/hooks/useHeists", () => ({
  useHeists: vi.fn(),
}))

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock("@/components/HeistCard", () => ({
  default: ({ heist }: { heist: Heist }) => <div data-testid="heist-card">{heist.title}</div>,
}))

vi.mock("@/components/HeistCardSkeleton", () => ({
  default: () => <div data-testid="heist-card-skeleton" />,
}))

import { useHeists } from "@/hooks/useHeists"
import HeistsPage from "@/app/(dashboard)/heists/page"

const emptyResult = { data: [], loading: false, error: null }

const makeHeist = (overrides: Partial<Heist> = {}): Heist => ({
  id: "heist-1",
  title: "The Museum Job",
  description: "desc",
  createdBy: "user-1",
  createdByCodename: "ShadowFox",
  assignedTo: "user-2",
  assignedToCodename: "IronMask",
  deadline: new Date(Date.now() - 1000),
  finalStatus: "success",
  createdAt: new Date("2026-03-01T09:00:00"),
  ...overrides,
})

describe("HeistsPage — expired section", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders expired heist cards in the Expired Heists section", () => {
    const expiredHeist = makeHeist({ id: "exp-1", title: "Expired Vault Job" })
    vi.mocked(useHeists).mockImplementation((mode) => {
      if (mode === "expired") return { data: [expiredHeist], loading: false, error: null }
      return emptyResult
    })

    render(<HeistsPage />)

    expect(screen.getByText("Expired Heists")).toBeInTheDocument()
    expect(screen.getByText("Expired Vault Job")).toBeInTheDocument()
  })

  it("does not show expired heists in the active or assigned sections", () => {
    const activeHeist = makeHeist({ id: "act-1", title: "Active Bank Job", deadline: new Date(Date.now() + 1000 * 60 * 60) })
    const expiredHeist = makeHeist({ id: "exp-1", title: "Old Diamond Heist" })

    vi.mocked(useHeists).mockImplementation((mode) => {
      if (mode === "active") return { data: [activeHeist], loading: false, error: null }
      if (mode === "expired") return { data: [expiredHeist], loading: false, error: null }
      return emptyResult
    })

    render(<HeistsPage />)

    const cards = screen.getAllByTestId("heist-card")
    const titles = cards.map((c) => c.textContent)
    expect(titles).toContain("Active Bank Job")
    expect(titles).toContain("Old Diamond Heist")
  })

  it("shows the empty state message when there are no expired heists", () => {
    vi.mocked(useHeists).mockReturnValue(emptyResult)

    render(<HeistsPage />)

    expect(screen.getByText("No expired heists yet.")).toBeInTheDocument()
  })

  it("shows skeleton placeholders while expired heists are loading", () => {
    vi.mocked(useHeists).mockImplementation((mode) => {
      if (mode === "expired") return { data: [], loading: true, error: null }
      return emptyResult
    })

    render(<HeistsPage />)

    expect(screen.getAllByTestId("heist-card-skeleton").length).toBeGreaterThan(0)
  })
})
