import * as Y from 'yjs'
import { createMutex } from 'lib0/mutex'

class RelativeSelection {
  constructor(start, end, direction) {
    this.start = start
    this.end = end
    this.direction = direction
  }
}

const createRelativeSelection = (editor, monacoModel, type, monaco) => {
  const sel = editor.getSelection()
  if (sel !== null) {
    const startPos = sel.getStartPosition()
    const endPos = sel.getEndPosition()
    const start = Y.createRelativePositionFromTypeIndex(type, monacoModel.getOffsetAt(startPos))
    const end = Y.createRelativePositionFromTypeIndex(type, monacoModel.getOffsetAt(endPos))
    return new RelativeSelection(start, end, sel.getDirection())
  }
  return null
}

const createMonacoSelectionFromRelativeSelection = (editor, type, relSel, doc, monaco) => {
  const start = Y.createAbsolutePositionFromRelativePosition(relSel.start, doc)
  const end = Y.createAbsolutePositionFromRelativePosition(relSel.end, doc)
  if (start !== null && end !== null && start.type === type && end.type === type) {
    const model = editor.getModel()
    const startPos = model.getPositionAt(start.index)
    const endPos = model.getPositionAt(end.index)
    return relSel.direction === 1
      ? new monaco.Selection(endPos.lineNumber, endPos.column, startPos.lineNumber, startPos.column)
      : new monaco.Selection(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column)
  }
  return null
}

export class MonacoBinding {
  constructor(ytext, editor, monaco, awareness = null) {
    this.doc = ytext.doc
    this.ytext = ytext
    this.editor = editor
    this.monaco = monaco
    this.monacoModel = editor.getModel()
    this.awareness = awareness
    this.mux = createMutex()
    this._savedSelection = null

    this._beforeTransaction = () => {
      this.mux(() => {
        if (this.editor.getModel() === this.monacoModel) {
          const rsel = createRelativeSelection(this.editor, this.monacoModel, this.ytext, this.monaco)
          if (rsel !== null) {
            this._savedSelection = rsel
          }
        }
      })
    }
    this.doc.on('beforeAllTransactions', this._beforeTransaction)

    this._decorations = []
    this._rerenderDecorations = () => {
      if (!this.awareness || !this.editor || !this.monacoModel || this.editor.getModel() !== this.monacoModel) {
        if (this._decorations.length > 0 && this.editor) {
          try {
            this._decorations = this.editor.deltaDecorations(this._decorations, [])
          } catch {}
        }
        return
      }

      const newDecorations = []
      this.awareness.getStates().forEach((state, clientID) => {
        if (
          clientID !== this.doc.clientID &&
          state.selection != null &&
          state.selection.anchor != null &&
          state.selection.head != null
        ) {
          const anchorAbs = Y.createAbsolutePositionFromRelativePosition(state.selection.anchor, this.doc)
          const headAbs = Y.createAbsolutePositionFromRelativePosition(state.selection.head, this.doc)
          if (anchorAbs !== null && headAbs !== null && anchorAbs.type === this.ytext && headAbs.type === this.ytext) {
            let start, end, afterContentClassName, beforeContentClassName
            if (anchorAbs.index < headAbs.index) {
              start = this.monacoModel.getPositionAt(anchorAbs.index)
              end = this.monacoModel.getPositionAt(headAbs.index)
              afterContentClassName = 'yRemoteSelectionHead yRemoteSelectionHead-' + clientID
              beforeContentClassName = null
            } else {
              start = this.monacoModel.getPositionAt(headAbs.index)
              end = this.monacoModel.getPositionAt(anchorAbs.index)
              afterContentClassName = null
              beforeContentClassName = 'yRemoteSelectionHead yRemoteSelectionHead-' + clientID
            }
            newDecorations.push({
              range: new this.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
              options: {
                className: 'yRemoteSelection yRemoteSelection-' + clientID,
                afterContentClassName,
                beforeContentClassName,
              },
            })
          }
        }
      })
      try {
        this._decorations = this.editor.deltaDecorations(this._decorations, newDecorations)
      } catch {}
    }

    this._ytextObserver = (event) => {
      this.mux(() => {
        let index = 0
        event.delta.forEach((op) => {
          if (op.retain !== undefined) {
            index += op.retain
          } else if (op.insert !== undefined) {
            const pos = this.monacoModel.getPositionAt(index)
            const range = new this.monaco.Selection(pos.lineNumber, pos.column, pos.lineNumber, pos.column)
            const insert = op.insert
            this.monacoModel.applyEdits([{ range, text: insert }])
            index += insert.length
          } else if (op.delete !== undefined) {
            const pos = this.monacoModel.getPositionAt(index)
            const endPos = this.monacoModel.getPositionAt(index + op.delete)
            const range = new this.monaco.Selection(pos.lineNumber, pos.column, endPos.lineNumber, endPos.column)
            this.monacoModel.applyEdits([{ range, text: '' }])
          }
        })

        if (this._savedSelection !== null) {
          const sel = createMonacoSelectionFromRelativeSelection(
            this.editor,
            this.ytext,
            this._savedSelection,
            this.doc,
            this.monaco
          )
          this._savedSelection = null
          if (sel !== null) {
            this.editor.setSelection(sel)
          }
        }
      })
      this._rerenderDecorations()
    }
    this.ytext.observe(this._ytextObserver)

    const ytextValue = this.ytext.toString()
    if (this.monacoModel.getValue() !== ytextValue) {
      this.monacoModel.setValue(ytextValue)
    }

    this._monacoChangeHandler = this.monacoModel.onDidChangeContent((event) => {
      this.mux(() => {
        this.doc.transact(() => {
          event.changes
            .slice()
            .sort((change1, change2) => change2.rangeOffset - change1.rangeOffset)
            .forEach((change) => {
              this.ytext.delete(change.rangeOffset, change.rangeLength)
              this.ytext.insert(change.rangeOffset, change.text)
            })
        }, this)
      })
    })

    this._cursorSelectionHandler = this.editor.onDidChangeCursorSelection(() => {
      if (!this.awareness) return
      if (this.editor.getModel() === this.monacoModel) {
        const sel = this.editor.getSelection()
        if (sel === null) return
        let anchor = this.monacoModel.getOffsetAt(sel.getStartPosition())
        let head = this.monacoModel.getOffsetAt(sel.getEndPosition())
        if (sel.getDirection && sel.getDirection() === 1) {
          const tmp = anchor
          anchor = head
          head = tmp
        }
        this.awareness.setLocalStateField('selection', {
          anchor: Y.createRelativePositionFromTypeIndex(this.ytext, anchor),
          head: Y.createRelativePositionFromTypeIndex(this.ytext, head),
        })
      }
    })

    if (this.awareness) {
      this.awareness.on('change', this._rerenderDecorations)
    }
  }

  syncValue() {
    if (!this.monacoModel || !this.ytext) return
    const ytextValue = this.ytext.toString()
    if (this.monacoModel.getValue() !== ytextValue) {
      this.mux(() => {
        this.monacoModel.setValue(ytextValue)
      })
    }
  }

  destroy() {
    this._monacoChangeHandler?.dispose()
    this._cursorSelectionHandler?.dispose()
    this.ytext.unobserve(this._ytextObserver)
    this.doc.off('beforeAllTransactions', this._beforeTransaction)
    if (this.awareness) {
      this.awareness.off('change', this._rerenderDecorations)
    }
    if (this._decorations.length > 0 && this.editor) {
      try {
        this.editor.deltaDecorations(this._decorations, [])
      } catch {}
    }
  }
}
