import { describe, expect, it } from "vitest"
import { cn } from "../utils"

describe("cn", () => {
  it("combines class names", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white")
  })

  it("merges tailwind conflicts by keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })
})
