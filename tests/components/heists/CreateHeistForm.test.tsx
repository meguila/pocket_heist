import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: "serverTimestamp" })),
}))

vi.mock("@/lib/firebase", () => ({
  db: {},
}))

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(() => ({
    user: { uid: "user-1", displayName: "SilentFoxRogue" },
    isLoading: false,
  })),
}))

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

import { getDocs, addDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import CreateHeistForm from "@/components/heists/CreateHeistForm"

const mockUsers = [
  { id: "user-1", codename: "SilentFoxRogue" },
  { id: "user-2", codename: "BrazenViperFixer" },
]

function makeSnapshot(users: { id: string; codename: string }[]) {
  return {
    docs: users.map((u) => ({ id: u.id, data: () => u })),
  }
}

describe("CreateHeistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDocs).mockResolvedValue(makeSnapshot(mockUsers) as never)
  })

  it("renders Title, Description, and Assign To fields", async () => {
    render(<CreateHeistForm />)
    expect(screen.getByLabelText("Title")).toBeInTheDocument()
    expect(screen.getByLabelText("Description")).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText("Assign To")).toBeInTheDocument()
    })
  })

  it("populates the Assign To dropdown with codenames after users load", async () => {
    render(<CreateHeistForm />)
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "SilentFoxRogue" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "BrazenViperFixer" })).toBeInTheDocument()
    })
  })

  it("disables the submit button while the form is submitting", async () => {
    const user = userEvent.setup()
    vi.mocked(addDoc).mockReturnValue(new Promise(() => {}) as never)
    render(<CreateHeistForm />)

    await waitFor(() => screen.getByRole("option", { name: "SilentFoxRogue" }))

    await user.type(screen.getByLabelText("Title"), "The Morning Muffin Job")
    await user.type(screen.getByLabelText("Description"), "Intercept the breakfast cart.")
    await user.click(screen.getByRole("button", { name: /create heist/i }))

    expect(screen.getByRole("button", { name: /creating heist/i })).toBeDisabled()
  })

  it("calls addDoc with the correct payload and redirects to /heists on success", async () => {
    const user = userEvent.setup()
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as never)
    vi.mocked(addDoc).mockResolvedValue({ id: "new-heist-id" } as never)

    render(<CreateHeistForm />)
    await waitFor(() => screen.getByRole("option", { name: "SilentFoxRogue" }))

    await user.type(screen.getByLabelText("Title"), "The Morning Muffin Job")
    await user.type(screen.getByLabelText("Description"), "Intercept the breakfast cart.")
    await user.click(screen.getByRole("button", { name: /create heist/i }))

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledOnce()
      const payload = vi.mocked(addDoc).mock.calls[0][1]
      expect(payload).toMatchObject({
        title: "The Morning Muffin Job",
        description: "Intercept the breakfast cart.",
        createdBy: "user-1",
        createdByCodename: "SilentFoxRogue",
        assignedTo: "user-1",
        assignedToCodename: "SilentFoxRogue",
        finalStatus: null,
      })
      expect(pushMock).toHaveBeenCalledWith("/heists")
    })
  })

  it("shows an inline error when the Firestore write fails", async () => {
    const user = userEvent.setup()
    vi.mocked(addDoc).mockRejectedValue(new Error("Network error"))

    render(<CreateHeistForm />)
    await waitFor(() => screen.getByRole("option", { name: "SilentFoxRogue" }))

    await user.type(screen.getByLabelText("Title"), "The Morning Muffin Job")
    await user.type(screen.getByLabelText("Description"), "Intercept the breakfast cart.")
    await user.click(screen.getByRole("button", { name: /create heist/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to create heist. Please try again.")
    })
  })

  it("does not call addDoc when Title is empty", async () => {
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => screen.getByRole("option", { name: "SilentFoxRogue" }))

    await user.type(screen.getByLabelText("Description"), "Intercept the breakfast cart.")
    await user.click(screen.getByRole("button", { name: /create heist/i }))

    expect(addDoc).not.toHaveBeenCalled()
  })

  it("does not call addDoc when Description is empty", async () => {
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => screen.getByRole("option", { name: "SilentFoxRogue" }))

    await user.type(screen.getByLabelText("Title"), "The Morning Muffin Job")
    await user.click(screen.getByRole("button", { name: /create heist/i }))

    expect(addDoc).not.toHaveBeenCalled()
  })
})
