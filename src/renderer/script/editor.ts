
import { EditorView } from 'codemirror';
import { Compartment} from "@codemirror/state"

import {keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
        rectangularSelection, crosshairCursor,
        lineNumbers, highlightActiveLineGutter,
        highlightWhitespace } from "@codemirror/view"
import {Extension, EditorState} from "@codemirror/state"
import {defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
        foldGutter, foldKeymap } from "@codemirror/language"
import {defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import {searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from "@codemirror/autocomplete"
import {lintKeymap} from "@codemirror/lint"


class Editor {
    private view: EditorView;
    private lineNumbersCompartment = new Compartment();
    private lineWrapCompartment = new Compartment();
    private highlightWhitespaceCompartment = new Compartment();

    constructor(targetElement: HTMLElement, initialText: string='') {
        this.view = new EditorView({
            doc: initialText,
            extensions: [
                this.lineNumbersCompartment.of([]),
                this.lineWrapCompartment.of([]),
                this.highlightWhitespaceCompartment.of([]),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                history(),
                foldGutter(),
                drawSelection(),
                dropCursor(),
                EditorState.allowMultipleSelections.of(true),
                indentOnInput(),
                syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                rectangularSelection(),
                crosshairCursor(),
                highlightActiveLine(),
                highlightSelectionMatches(),
                keymap.of([
                    indentWithTab,
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    ...searchKeymap,
                    ...historyKeymap,
                    ...foldKeymap,
                    ...completionKeymap,
                    ...lintKeymap
                ])
            ],
            parent: targetElement,
        });
    }

    public getText(): string {
        return this.view.state.doc.toString()
    }

    public setText(text: string) {
        this.view.dispatch({
            changes: {
                from: 0,
                to: this.view.state.doc.length,
                insert: text,
            },
        });
    }

    public appendText(text: string) {
        // Add text to end of doc
        const addNewLine = this.view.state.doc.length == 0 ? '' : '\n';
        this.view.dispatch({
            changes: {
                from: this.view.state.doc.length,
                to: this.view.state.doc.length,
                insert: addNewLine + text,
            },
        });
    }

    public enableLineNumbers(on: boolean=true) {
        this.view.dispatch({
            effects: this.lineNumbersCompartment.reconfigure(on ? lineNumbers() : [])
        })
    }
    public enableLineWrap(on: boolean=true) {
        this.view.dispatch({
            effects: this.lineWrapCompartment.reconfigure(on ? EditorView.lineWrapping : [])
        })
    }
    public enableHighlightWhitespace(on: boolean=true) {
        this.view.dispatch({
            effects: this.highlightWhitespaceCompartment.reconfigure(on ? highlightWhitespace() : [])
        })
    }
}

export default Editor;
