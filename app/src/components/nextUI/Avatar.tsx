import React from "react"
import { Avatar } from "@nextui-org/react"

export default function NextAvatar() {
  return (
    <div className="flex gap-3 items-center">
      <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
      <Avatar name="Junior" />
      <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
      <Avatar name="Jane" />
      <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
      <Avatar name="Joe" />
      <Avatar
        isBordered
        radius="full"
        src="https://i.pravatar.cc/150?u=a04258114e29026708c"
      />
      <Avatar
        isBordered
        radius="lg"
        src="https://i.pravatar.cc/150?u=a04258114e29026302d"
      />
      <Avatar
        isBordered
        radius="md"
        src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
      />
      <Avatar
        isBordered
        radius="sm"
        src="https://i.pravatar.cc/150?u=a04258a2462d826712d"
      />
    </div>
  )
}
