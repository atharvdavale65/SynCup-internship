import React from "react"
import PropTypes from "prop-types"
import {
  Editor,
  EditorState,
  getDefaultKeyBinding,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js"
import "./RichTextEditor.css"
import "draft-js/dist/Draft.css"
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatListBulleted,
  MdFormatListNumbered,
} from "react-icons/md"
import { GoCodeSquare } from "react-icons/go"

function StyleButton({ active, label, onToggle, style }) {
  const onToggleHandler = (e) => {
    e.preventDefault()
    onToggle(style)
  }

  let buttonClassName = "RichEditor-styleButton"
  if (active) {
    buttonClassName += " RichEditor-activeButton"
  }

  return (
    <button
      type="button"
      className={buttonClassName}
      onMouseDown={onToggleHandler}
    >
      {label}
    </button>
  )
}

StyleButton.propTypes = {
  active: PropTypes.bool.isRequired,
  label: PropTypes.element.isRequired,
  onToggle: PropTypes.func.isRequired,
  style: PropTypes.string.isRequired,
}

const BLOCK_TYPES = [
  {
    label: <MdFormatListBulleted className="w-5 h-5" />,
    style: "unordered-list-item",
  },
  {
    label: <MdFormatListNumbered className="w-5 h-5" />,
    style: "ordered-list-item",
  },
]

function BlockStyleControls({ editorState, onToggle }) {
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </div>
  )
}

BlockStyleControls.propTypes = {
  editorState: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
}

const INLINE_STYLES = [
  { label: <MdFormatBold className="w-5 h-5 " />, style: "BOLD" },
  { label: <MdFormatItalic className="w-5 h-5" />, style: "ITALIC" },
  { label: <MdFormatUnderlined className="w-5 h-5" />, style: "UNDERLINE" },
  { label: <GoCodeSquare className="w-5 h-5" />, style: "CODE" },
]

function InlineStyleControls({ editorState, onToggle }) {
  const currentStyle = editorState.getCurrentInlineStyle()

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </div>
  )
}

InlineStyleControls.propTypes = {
  editorState: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
}

class RichTextEditor extends React.Component {
  constructor(props) {
    super(props)
    const { initialContentState } = props
    this.state = {
      editorState: initialContentState
        ? EditorState.createWithContent(
            convertFromRaw(JSON.parse(initialContentState)),
          )
        : EditorState.createEmpty(),
    }

    this.handleKeyCommand = this.handleKeyCommand.bind(this)
    this.mapKeyToEditorCommand = this.mapKeyToEditorCommand.bind(this)
    this.toggleBlockType = this.toggleBlockType.bind(this)
    this.toggleInlineStyle = this.toggleInlineStyle.bind(this)
  }

  componentDidMount() {
    const { initialContentState } = this.props
    if (initialContentState) {
      const contentState = convertFromRaw(JSON.parse(initialContentState))
      const editorState = EditorState.createWithContent(contentState)
      this.setState({ editorState })
    }
  }

  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }
    return false
  }

  onChange = (newEditorState) => {
    const { onDescriptionChange } = this.props
    this.setState({ editorState: newEditorState })
    const contentState = newEditorState.getCurrentContent()
    const rawContentState = JSON.stringify(convertToRaw(contentState))
    onDescriptionChange(rawContentState)
  }

  mapKeyToEditorCommand(e) {
    if (e.keyCode === 9) {
      const { editorState } = this.state
      const newEditorState = RichUtils.onTab(e, editorState, 4)
      if (newEditorState !== editorState) {
        this.onChange(newEditorState)
        return "handled"
      }
      return "not-handled"
    }
    return getDefaultKeyBinding(e)
  }

  toggleBlockType(blockType) {
    const { editorState } = this.state
    this.onChange(RichUtils.toggleBlockType(editorState, blockType))
  }

  toggleInlineStyle(inlineStyle) {
    const { editorState } = this.state
    this.onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  render() {
    const { editorState } = this.state
    let className = "RichEditor-editor"
    const contentState = editorState.getCurrentContent()
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== "unstyled") {
        className += " RichEditor-hidePlaceholder"
      }
    }

    const styleMap = {
      CODE: {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
      },
    }

    const getBlockStyle = (block) => {
      switch (block.getType()) {
        case "blockquote":
          return "RichEditor-blockquote"
        default:
          return null
      }
    }

    return (
      <div className="RichEditor-root">
        <div className="flex gap-1">
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />
        </div>
        <div
          role="button"
          className={className}
          onClick={() => this.editorRef.focus()}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              this.editorRef.focus()
            }
          }}
        >
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.mapKeyToEditorCommand}
            onChange={this.onChange}
            placeholder="Write a description..!"
            ref={(ref) => {
              this.editorRef = ref
            }}
            spellCheck
          />
        </div>
      </div>
    )
  }
}

RichTextEditor.propTypes = {
  initialContentState: PropTypes.string,
  onDescriptionChange: PropTypes.func.isRequired,
}

RichTextEditor.defaultProps = {
  initialContentState: "",
}

export default RichTextEditor
