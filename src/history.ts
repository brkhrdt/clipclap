import * as crypto from 'crypto';

import { Clip, ClipId } from './clip';
import logger from './logger';

class Clipboard {
    private clipboard: Map<ClipId, Clip>;
    private maxHistorySize: number;
    private history: ClipHistory;

    constructor(maxHistorySize = 30) {
        this.clipboard = new Map<ClipId, Clip>();
        this.history = new ClipHistory();
        this.maxHistorySize = maxHistorySize;
    }

    addClip(clip: Clip): void {
        if (this.clipboard.size >= this.maxHistorySize) {
            this.dropOldestClip();
        }

        let id = '';
        if ('id' in clip) {
            id = clip.id;
        } else {
            id = this.generateKey(clip.data);
            clip.id = id;
        }

        if (!(this.history.has(id))) {
            this.clipboard.set(id, clip);
        }
        this.history.add(id);
    }

    updateClip(clip: Clip): void {
        if (!this.clipboard.has(clip.id)) {
            throw new Error(`Clipboard does not contain the id: ${clip.id}`);
        }
        this.clipboard.set(clip.id, clip);
        logger.debug(`Existing clip updated: ${JSON.stringify(clip)}`);
    }

    private dropOldestClip(): void {
        const oldestClipId = this.history.pop();
        this.clipboard.delete(oldestClipId);
    }

    getClip(id: ClipId): Clip | undefined {
        return this.clipboard.get(id);
    }

    getClips(): Clip[] {
        const clips = this.history.all(); // get clipids
        return clips.map((id) => this.clipboard.get(id)); // get clips for each id
    }

    clearClips(): void {
        this.clipboard.clear();
        this.history.clear();
    }

    getClipboardSize(): number {
        return this.clipboard.size;
    }

    generateKey(str: string): ClipId {
        const hash = crypto.createHash('sha256');
        hash.update(str);
        const key = hash.digest('hex');
        return key;
    }
}

class ClipHistory {
    private queue: ClipId[] = [];
    private set: Set<ClipId> = new Set();


    constructor() {
    }

    add(key: ClipId): void {
        if (this.set.has(key)) {
            // id already exists, filter it out and then add to top
            this.queue = this.queue.filter((el) => el !== key);
        }
        this.queue.unshift(key);

        this.set.add(key);
    }

    has(key: ClipId): boolean {
        return this.set.has(key);
    }

    clear(): void {
        this.queue = [];
        this.set.clear();
    }

    all(): ClipId[] {
        return this.queue;
    }

    pop(): ClipId | undefined {
        const item = this.queue.pop();
        if (item !== undefined) {
            this.set.delete(item);
        }
        return item;
    }

    peek(): ClipId | undefined {
        return this.queue[0];
    }

    get length(): number {
        return this.queue.length;
    }
}

export { Clipboard, ClipHistory };
