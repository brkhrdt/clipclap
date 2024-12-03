import { Clip } from './clip';

class ClipboardHistory {
    private clipboard: Map<number, Clip>;
    private maxHistorySize: number;

    constructor(maxHistorySize: number = 30) {
        this.clipboard = new Map<number, Clip>();
        this.maxHistorySize = maxHistorySize;
    }

    addClip(clip: Clip): void {
        if (this.clipboard.size >= this.maxHistorySize) {
            this.dropOldestClip();
        }
        
        this.clipboard.set(clip.id, clip);
    }

    updateClip(clip: Clip): void {
        if (!this.clipboard.has(clip.id)) {
            throw new Error(`Clipboard does not contain the id: ${clip.id}`);
        }
        this.clipboard.set(clip.id, clip);
    }

    private dropOldestClip(): void {
        const firstKey = this.clipboard.keys().next().value;
        this.clipboard.delete(firstKey);
    }

    getClip(id: number): Clip | undefined {
        return this.clipboard.get(id);
    }

    getClips(): Clip[] {
        return Array.from(this.clipboard.values()).reverse();
    }

    clearClips(): void {
        this.clipboard.clear();
    }

    getClipboardSize(): number {
        return this.clipboard.size;
    }
}

export { ClipboardHistory };
