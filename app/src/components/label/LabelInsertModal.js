import React, { useState, useEffect } from "react"
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react"
import PropTypes from "prop-types"

import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

const colorOptions = [
  { color: "#EF9A9A", name: "PaleOrange" },
  { color: "#E1E1E1", name: "white" },
  { color: "#D3A2EB", name: "LightPurple" },
  { color: "#B39DDB", name: "Purple" },
  { color: "#9FA9DA", name: "PaleBlue" },
  { color: "#90CAF9", name: "Blue" },
  { color: "#93C0EA", name: "LightBlue" },
  { color: "#81CBC4", name: "BlueGreen" },
  { color: "#C5E2A5", name: "LightGreen" },
  { color: "#F8E0A3", name: "PaleYellow" },
  { color: "#FFAC95", name: "Cream" },
  { color: "#BCABA4", name: "LightBlue" },
  { color: "#E8DFBA", name: "Humancolor" },
]

function LabelInsertModal({ open, onClose, onInsert, onUpdate, initialData }) {
  const [labelName, setLabelName] = useState(initialData?.name || "")
  const { boardData } = useGlobalSyncupContext()
  const [selectedBoardId, setSelectedBoardId] = useState("")
  const [error, setError] = useState("")
  const [nameerror, setNameError] = useState("")
  const [selectedColor, setSelectedColor] = useState(
    initialData?.color || colorOptions[0].color,
  )
  const handleSelectionChange = (selecteditems) => {
    const selectedKeys = Array.from(selecteditems)
    setSelectedBoardId(selectedKeys)
  }

  const handleInsert = () => {
    if (labelName === "") {
      setNameError("Please enter a label name")
      return
    }
    if (selectedBoardId === "") {
      setError("Please select a board")
    } else {
      onInsert({
        name: labelName,
        color: selectedColor,
        boardId: selectedBoardId,
      })
      onClose()
    }
  }
  const handleUpdate = () => {
    onUpdate({ id: initialData.id, name: labelName, color: selectedColor })
    onClose()
  }
  useEffect(() => {
    if (open && !initialData) {
      setLabelName("")
      setSelectedColor(colorOptions[0].color)
    } else if (initialData) {
      setLabelName(initialData.name)
      setSelectedColor(initialData.color)
    }
  }, [open, initialData])

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalContent>
        <>
          <ModalHeader className="text-xl font-medium">
            {" "}
            {initialData ? "Update Label" : "Insert Label"}
          </ModalHeader>
          <ModalBody>
            <Input
              type="text"
              placeholder="Label name"
              labelPlacement="inside"
              variant="bordered"
              color="#7754bd"
              errorMessage={nameerror}
              value={labelName}
              onChange={(e) => {
                setLabelName(e.target.value)
                setNameError("")
              }}
            />
            {!initialData && (
              <Select
                placeholder="Select board"
                selectedKeys={selectedBoardId}
                errorMessage={error}
                variant="bordered"
                onSelectionChange={handleSelectionChange}
                style={{ maxHeight: "3em", overflow: "auto" }}
              >
                {boardData.map((board) => (
                  <SelectItem
                    key={board.id}
                    value={board.value}
                    onClick={() => setError("")}
                    color="secondary"
                  >
                    {board.name}
                  </SelectItem>
                ))}
              </Select>
            )}
            <div className="text-lg mt-1">Pick a color:</div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {colorOptions.map((option) => (
                <div
                  key={option.color}
                  onClick={() => setSelectedColor(option.color)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedColor(option.color)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: option.color,
                    cursor: "pointer",
                    border:
                      selectedColor === option.color
                        ? "2px solid #1976D2"
                        : "none",
                    transition: "border 0.3s ease-in-out",
                  }}
                />
              ))}
            </div>
            <Button
              mt={2}
              style={{
                color: "#7754bd",
                backgroundColor: "#ede7f6",
                "&:hover": {
                  backgroundColor: "#7754bd",
                  color: "#fff",
                  cursor: "pointer",
                },
              }}
              onClick={initialData ? handleUpdate : handleInsert}
            >
              {initialData ? "Update Label" : "Add Label"}
            </Button>
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  )
}

LabelInsertModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onInsert: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }),
}

LabelInsertModal.defaultProps = {
  initialData: null,
}

export default LabelInsertModal
