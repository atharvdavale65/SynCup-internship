"use client"

import React from "react"
import { DragDropContext, DragDropContextProps } from "react-beautiful-dnd"

function DndContext({ children, onDragEnd }: DragDropContextProps) {
  return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
}
export default DndContext
