import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Clipboard, ClipHistory } from '../src/history';
import { Clip } from '../src/clip';

describe('Clipboard', () => {
    let clipboard: Clipboard;
    let clip1: Clip;
    let clip2: Clip;
    let clip3: Clip;
    let clip4: Clip;

    beforeEach(() => {
        clipboard = new Clipboard(3);
        // ids get added when ref added to clipboard
        clip1 = { date: new Date(), data: '1' };
        clip2 = { date: new Date(), data: '2' };
        clip3 = { date: new Date(), data: '3' };
        clip4 = { date: new Date(), data: '4' };
    });

    it('should add a clip to the clipboard', () => {
        clipboard.addClip(clip1);
        expect(clipboard.getClips()).toEqual([clip1]);
    });

    it('should move repeated clip to the top', () => {
        clipboard.addClip(clip1);
        clipboard.addClip(clip2);
        clipboard.addClip(clip1);
        expect(clipboard.getClips()).toEqual([clip1, clip2]);
    });

    it('should move repeated clip to the top and preserve tags', () => {
        clipboard.addClip(clip1);
        let clip1Mod =JSON.parse(JSON.stringify(clip1)); //deep copy
        clip1Mod.tags = ['test'];
        clipboard.updateClip(clip1Mod);
        clipboard.addClip(clip2);
        clipboard.addClip(clip1);
        expect(clipboard.getClips()).toEqual([clip1Mod, clip2]);
    });

    it('should clear the clipboard', () => {
        clipboard.addClip(clip1);
        clipboard.clearClips();
        expect(clipboard.getClips()).toEqual([]);
    });

    it('should not exceed max size', () => {
        clipboard.addClip(clip1);
        clipboard.addClip(clip2);
        clipboard.addClip(clip3);
        clipboard.addClip(clip4);
        expect(clipboard.getClips()).toEqual([clip4, clip3, clip2]);
    });
});

describe('ClipHistory', () => {
    let clipHistory: ClipHistory;

    beforeEach(() => {
        clipHistory = new ClipHistory();
    });

    it('should add a clip to the history', () => {
        clipHistory.add('clip1');
        expect(clipHistory.all()).toEqual(['clip1']);
    });

    it('should add multiple clips and maintain correct order', () => {
        clipHistory.add('clip1');
        clipHistory.add('clip2');
        clipHistory.add('clip3');
        expect(clipHistory.all()).toEqual(['clip3', 'clip2', 'clip1']);
    });

    it('should not add duplicate clips', () => {
        clipHistory.add('clip1');
        clipHistory.add('clip1'); // Duplicate
        expect(clipHistory.all()).toEqual(['clip1']);
    });

    it('should not exceed given max with pop', () => {
        clipHistory.add('clip1');
        clipHistory.add('clip2');
        clipHistory.pop();
        clipHistory.add('clip3');
        clipHistory.add('clip4');
        expect(clipHistory.all()).toEqual(['clip4', 'clip3', 'clip2']);
    });

    it('should pop the first added clip', () => {
        clipHistory.add('clip1');
        clipHistory.add('clip2');
        const popped = clipHistory.pop();
        expect(popped).toBe('clip1');
        expect(clipHistory.all()).toEqual(['clip2']);
    });

    it('should return undefined when popping from an empty history', () => {
        const popped = clipHistory.pop();
        expect(popped).toBeUndefined();
    });

    it('should peek the last added clip', () => {
        clipHistory.add('clip1');
        clipHistory.add('clip2');
        expect(clipHistory.peek()).toBe('clip2');
    });

    it('should return undefined when peeking from an empty history', () => {
        expect(clipHistory.peek()).toBeUndefined();
    });

    it('should return the correct length of the history', () => {
        expect(clipHistory.length).toBe(0);
        clipHistory.add('clip1');
        expect(clipHistory.length).toBe(1);
        clipHistory.add('clip2');
        clipHistory.add('clip3');
        expect(clipHistory.length).toBe(3);
    });

    it('should handle adding and removing the same clip multiple times', () => {
        clipHistory.add('clip1');
        clipHistory.add('clip2');
        clipHistory.pop();
        clipHistory.add('clip1'); // Adding clip1 again
        expect(clipHistory.all()).toEqual(['clip1', 'clip2']);
    });
});
