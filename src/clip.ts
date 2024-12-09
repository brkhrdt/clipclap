type ClipId = number;
type ClipData = string;
type Clip = {
    id: ClipId;
    date: Date;
    data: ClipData;
};

export { Clip, ClipData };
