// import { NextRequest } from "next/server";
// import { frames } from "../frames";
// import { ActionMetadata } from "frames.js";
// import { Button } from "frames.js/next";
// const appURL = 'https://casterscan.com';

// export const GET = frames((ctx) => { 
//     const hash = ctx.message?.castId;
//     console.log('message', ctx)
//     return {
//       image: `https://client.warpcast.com/v2/cast-image?castHash=${hash}`,
//       imageOptions: {
//         aspectRatio: '1:1'
//       },
//       buttons: [
//         <Button action="link" target={`${appURL}/casts/${hash}`}>
//           View on Casterscan
//         </Button>,
//       ],
//     };
// });