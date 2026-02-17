import { render, screen } from "@testing-library/react"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders the first letter for a single word name", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("renders the first two uppercase letters for a PascalCase name", () => {
    render(<Avatar name="PascalName" />)
    expect(screen.getByText("PN")).toBeInTheDocument()
  })

  it("renders a single letter for an all-lowercase name", () => {
    render(<Avatar name="john" />)
    expect(screen.getByText("J")).toBeInTheDocument()
  })
})
