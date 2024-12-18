
import { EditorView } from 'codemirror';
import { Compartment} from "@codemirror/state"

import {keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
        rectangularSelection, crosshairCursor,
        lineNumbers, highlightActiveLineGutter} from "@codemirror/view"
import {Extension, EditorState} from "@codemirror/state"
import {defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
        foldGutter, foldKeymap} from "@codemirror/language"
import {defaultKeymap, history, historyKeymap} from "@codemirror/commands"
import {searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from "@codemirror/autocomplete"
import {lintKeymap} from "@codemirror/lint"


class Editor {
    private view: EditorView;
    private lineNumbersCompartment = new Compartment();
    private lineWrapCompartment = new Compartment();

    constructor(targetElement: HTMLElement, initialText: string='') {
        this.view = new EditorView({
            doc: initialText,
            extensions: [
                this.lineNumbersCompartment.of(lineNumbers()),
                this.lineWrapCompartment.of(EditorView.lineWrapping),
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
        this.view.dispatch({
            changes: {
                from: this.view.state.doc.length,
                to: this.view.state.doc.length,
                insert: text,
            },
        });
    }

    public appendText(text: string) {
        this.view.dispatch({
            changes: {
                from: this.view.state.doc.length,
                to: this.view.state.doc.length,
                insert: text,
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
}

export default Editor;
