// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react"

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />cket Heist
        </h1>
        <div>Pull off something legendary.</div>
        <p>
          Welcome to Pocket Heist — the app where ordinary workdays become
          extraordinary adventures. Recruit your crew, plan your move, and
          pull off the perfect office caper before the coffee gets cold.
        </p>
        <p>
          Whether you&apos;re orchestrating a surprise birthday ambush or
          coordinating a stealthy desk swap, every heist starts here.
          No vault required. Just a team, a plan, and nerves of steel.
        </p>
      </div>
    </div>
  )
}
