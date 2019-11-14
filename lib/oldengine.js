// const request = require("request");
// const Promise = require("bluebird");
// let API_VERSION = 5;
// let API_NAME_LIST = {video: "advideos", image: "adimage"};
// // let host = 'https://graph-video.facebook.com';
// let host = 'http://localhost:7000'; // for test
// let headers = {
//     'cache-control': 'no-cache',
//     'content-type': 'multipart/form-data;'
// };
// let fbupload =require('facebook-api-video-upload');
//
// function commonPostAPI(AD_ACCOUNT_ID, API_NAME, url, headers, formData) {
//     return new Promise((resolve, reject) => {
//         let options = {
//             method: 'POST',
//             url: `${host}/${API_VERSION}/${AD_ACCOUNT_ID}/${API_NAME}`,
//             formData: formData
//         };
//         if (headers) {
//             options.headers = headers;
//         }
//         request(options, function (error, response, body) {
//             if (error) throw new Error(error);
//             resolve(body)
//         });
//     }).catch((err) => {
//         console.log("\n Error in Request From Engine :", err);
//     })
// }
//
// function videoUploadEngine(AD_ACCOUNT_ID, ACCESS_TOKEN, file) {
//     return new Promise((resolve, reject) => {
//         // console.log("\n *****************************");
//         console.log("\n File", file);
//         // console.log("\n *****************************");
//         // console.log("\n File Name",file.name);
//         // console.log("\n *****************************");
//         // console.log("\n Files Size",file.size);
//         // console.log("\n *****************************");
//         // console.log("\n Files Buffer",file.data);
//         // console.log("\n *****************************");
//         if (AD_ACCOUNT_ID && ACCESS_TOKEN && checkFileSpec(file)) {
//             splitFile(file)
//             // commonPostAPI(AD_ACCOUNT_ID,API_NAME_LIST['video'],url, headers, formData)
//             //     .then((body) => {
//             //         body = JSON.parse(body);
//             //         // console.log("\n Result :", body);
//             //         resolve(body)
//             //     }).catch((err) => {
//             //     console.log("\n Error in Engine :", err);
//             // })
//         }
//     })
// }
//
// function checkFileSpec(file) {
//     return file && file.name && file.name.length && file.data && file.size
// }
//
// let reqVideoUpload = {access_token: '12345', upload_phase: 'start', file_size: '500'};
// let processVideoUpload = {
//     access_token: '12345',
//     upload_phase: 'transfer',
//     upload_session_id: '',
//     start_offset: '250',
//     video_file_chunk: '@<BINARY_CHUNK_FILE_NAME>'
// };
//
// function splitFile(file) {
//     return new Promise((resolve, reject) => {
//         let fileLength = file.data.toString().length;
//         let chunkSize = 40000;
//         console.log("\n *****************************");
//         console.log("\n File Buffer", file.data);
//         console.log("\n File Buffer Length", fileLength);
//         console.log("\n File Buffer chunksize", chunkSize);
//         console.log("\n *****************************");
//         for (let start = 0; start < fileLength ; start += chunkSize) {
//             const chunk = file.data.slice(start, chunkSize + 1);
//             console.log('\n chunk',chunk);
//         }
//     })
// };
//
// module.exports = {video: videoUploadEngine};
// let fs = require('fs');
// let data = fs.readFileSync('./testFiles/FlashtalkingPromoVideoFacebookSubtitles_1080x1350.mp4');
// videoUploadEngine(123, 214, {
//     name: 'FlashtalkingPromoVideoFacebookSubtitles_1080x1350.mp4',
//     data: data,
//     size: 2114141,
//     encoding: '7bit',
//     tempFilePath: '',
//     truncated: false,
//     mimetype: 'video/mp4',
//     md5: '74192c1766fed08db857718cd2453e50',
// });