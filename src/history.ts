// import { DataFrame, Series } from 'nodejs-polars';

// class ClipboardHistory {
//     private clips: DataFrame;

//     constructor() {
//         this.clips = new DataFrame({
//             date: Series('date', []),
//             data: Series('data', []),
//             type: Series('type', []),
//         });
//     }

//     recordClip(data: string, type: 'text' | 'image') {
//         const newRow = {
//             date: new Date(),
//             data: data,
//             type: type,
//         };
//         this.clips = this.clips.vstack(new DataFrame(newRow));
//     }

//     getHistory(): DataFrame {
//         return this.clips;
//     }
// }

// export default ClipboardHistory;
