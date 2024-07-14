import React from "react"
import { Tabs, Tab } from "@nextui-org/react"
import Teams from "./tabTeam"
import Boards from "./tabBoard"
import Members from "./tabMember"

function TeamN() {
  return (
    <div
      style={{ maxHeight: "100vh", overflowY: "auto", srollbarWidth: "none" }}
    >
      <h5
        className="text-[#7754bd] mb-4 font-bold"
        style={{
          fontWeight: "bold",
          marginLeft: "20px",
          fontSize: "1.4rem",
          marginTop: "15px",
        }}
      >
        Meet our Team
      </h5>
      <Tabs
        aria-label="Tabs colors"
        color="secondary"
        style={{ margin: "0 20px" }}
      >
        <Tab key="Teams" title="Teams">
          <Teams />
        </Tab>
        <Tab key="Members" title="Members">
          <Members />
        </Tab>
        <Tab key="Boards" title="Boards">
          <Boards />
        </Tab>
      </Tabs>
    </div>
  )
}

export default TeamN
