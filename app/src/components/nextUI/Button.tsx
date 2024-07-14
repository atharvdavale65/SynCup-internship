import React from "react"
import { Button } from "@nextui-org/react"

export default function NextButton() {
  return (
    <div>
      <Button color="default">Default</Button>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
      <Button isDisabled color="primary">
        Button
      </Button>
    </div>
  )
}
