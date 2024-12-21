type ClipId = string;
type ClipData = string;
type Clip = {
    date: Date;
    data: ClipData;
    id?: ClipId;
};

export { Clip, ClipData, ClipId };
