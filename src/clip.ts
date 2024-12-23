type ClipId = string;
type ClipData = string;
type ClipTags = string[];
type Clip = {
    date: Date;
    data: ClipData;
    id?: ClipId;
    tags?: ClipTags;
};

export { Clip, ClipData, ClipId, ClipTags };
