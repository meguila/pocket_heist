import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import HeistCard from "@/components/HeistCard"
import { Heist } from "@/types/firestore"

const mockHeist: Heist = {
  id: "heist-1",
  title: "The Diamond Job",
  description: "Steal the diamond from the museum before dawn.",
  createdBy: "user-1",
  createdByCodename: "ShadowFox",
  assignedTo: "user-2",
  assignedToCodename: "IronMask",
  deadline: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48 hours from now
  finalStatus: null,
  createdAt: new Date("2026-03-01T09:24:00"),
}

describe("HeistCard", () => {
  it("renders the heist title as a link to /heists/:id", () => {
    render(<HeistCard heist={mockHeist} />)

    const link = screen.getByRole("link", { name: /The Diamond Job/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/heists/heist-1")
  })

  it("displays the assignedToCodename with To: label", () => {
    render(<HeistCard heist={mockHeist} />)

    expect(screen.getByText("To:")).toBeInTheDocument()
    expect(screen.getByText("IronMask")).toBeInTheDocument()
  })

  it("displays the createdByCodename with By: label", () => {
    render(<HeistCard heist={mockHeist} />)

    expect(screen.getByText("By:")).toBeInTheDocument()
    expect(screen.getByText("ShadowFox")).toBeInTheDocument()
  })

  it("displays a time remaining string", () => {
    render(<HeistCard heist={mockHeist} />)

    expect(screen.getByText(/\d+ (day|hour|minute)s? left/i)).toBeInTheDocument()
  })

  it("displays the createdAt date", () => {
    render(<HeistCard heist={mockHeist} />)

    expect(screen.getByText(/Mar 1,/i)).toBeInTheDocument()
  })

  it('shows "Expired" when the deadline has passed', () => {
    const expiredHeist: Heist = {
      ...mockHeist,
      deadline: new Date(Date.now() - 1000),
    }
    render(<HeistCard heist={expiredHeist} />)

    expect(screen.getByText("Expired")).toBeInTheDocument()
  })
})
