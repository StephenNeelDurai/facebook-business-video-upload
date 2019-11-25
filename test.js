let fs = require('fs');
let video = require('./lib/engine.js');
let filePath = "/home/neel/WebstormProjects/test/testFiles/testVideo1.mp4";
let options = {
    token: '1334',
    id: '523423',
    stream: filePath
};
let retryPath = '/home/neel/WebstormProjects/npmModules/facebook-business-video-upload/test.txt';
let retryObj = {status: false, path: retryPath};
// video(options) //
let reUpload = 0;

if (reUpload) {
    fs.readFile(retryPath, (err, res) => {
        try {
            // console.log(res.toString());
            let result = JSON.parse(res.toString());
            // console.log(result);
            if (checkValidRetryData(result)) {
                retryObj.status = true;
                options = {
                    token: result.args.token,
                    id: result.args.id,
                    stream: result.args.stream
                };
                retryObj.ids = result.ids;
                retryObj.start_offset = result.start_offset;
                retryObj.end_offset = result.end_offset;
                retry(options, retryObj);
            } else {
                console.log("Data missing", result);
            }
        } catch (err) {
            console.log("\n Error : \n", err);
        }
    })

} else {
    setTimeout(()=>{
        // stop process for testing retry
        process.exit()
    },40)
    uploadWithRetry(options, retryObj)

    // options.stream = fs.createReadStream(filePath);
    // normalUpload(options);
}

function checkValidRetryData(data) {
    return data && data.args && data.args.token && data.args.id && data.args.stream && data.ids && data.start_offset && data.end_offset;
}

function uploadWithRetry() {
    console.log("uploading With Retry false");
    video(options, retryObj) //
        .then((res) => {
            console.log(res);
        })
        .catch(err => {
            console.log("Error :", err);
        });
}

function retry(options, retryObj) {
    console.log("uploading With Retry true");
    video(options, retryObj) //
        .then((res) => {
            console.log(res);
        });
}


function normalUpload() {
    console.log("uploading normal");
    video(options) //
        .then((res) => {
            console.log(res);
        });
}
