import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import HeistCardSkeleton from "@/components/HeistCardSkeleton"

describe("HeistCardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<HeistCardSkeleton />)

    expect(container.firstChild).toBeTruthy()
  })

  it('has role="status" for accessibility', () => {
    render(<HeistCardSkeleton />)

    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it('has aria-label "Loading heist"', () => {
    render(<HeistCardSkeleton />)

    expect(screen.getByLabelText("Loading heist")).toBeInTheDocument()
  })
})
