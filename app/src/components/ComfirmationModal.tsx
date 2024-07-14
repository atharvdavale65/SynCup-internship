import React from "react"
import PropTypes from "prop-types"

function ConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-gray-300 rounded-md shadow-md">
      <p className="mb-4 text-lg font-bold">Are you sure?</p>
      <div className="flex justify-end">
        <button
          type="button"
          className="px-4 py-2 mr-2 bg-gray-200 rounded-md"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-red-500 text-white rounded-md"
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

ConfirmationModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default ConfirmationModal
