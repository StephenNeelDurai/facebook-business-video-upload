let fs = require('fs');
let path = require('path');
let video = require('./lib/engine.js');
let filePath = "/home/neel/WebstormProjects/test/testFiles/testVideo1.mp4";
let options = {
    token: '123',
    id: '321',
    stream: filePath
};
// path for storing logs
let retryObj = {status: false, path: null, uniqId: null};
let resumeUpload = 0; //

let uploadCacheFilePath = path.join(__dirname, 'cache'); // path for storing upload data cache
fs.readdir(uploadCacheFilePath, function (err, files) {
    console.log("\n Pending cache list", files);
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    if (files && files.length) {
        files.forEach(function (file) {
            let logFilePath = path.join(uploadCacheFilePath,file);
            console.log("\n\n ",logFilePath);
            fs.readFile(logFilePath, (err, res) => {
                try {
                    let result = JSON.parse(res.toString());
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
                        retryObj.path = logFilePath;
                        if (result.uniqId) {
                            retryObj.uniqId = result.uniqId
                        }
                        retry(options, retryObj);
                    } else {
                        console.log("Data missing", result);
                    }
                } catch (err) {
                    console.log("\n Error : \n", err);
                }
            })
        })

    } else {
        console.log("\n No pending files to upload. Uploading New");
        setTimeout(() => {
            // stop process for testing retry
            process.exit()
        }, 40);
        retryObj.path = `${uploadCacheFilePath}/${Date.now()}.txt`
        retryObj.uniqId = 7;
        uploadWithRetry(options, retryObj)
    }
});

function checkValidRetryData(data) {
    return data && data.args && data.args.token && data.args.id && data.args.stream && data.ids && data.start_offset && data.end_offset;
}

function uploadWithRetry() {
    console.log("Uploading With log...");
    video(options, retryObj) // retryObj status : false  and path : '/log.txt' to store log
        .then((res) => {
            console.log(res);
        })
        .catch(err => {
            console.log("Error :", err);
        });
}

function retry(options, retryObj) {
    console.log("\n Retrying With Cache data...");
    video(options, retryObj)  // retryObj status : true  and path : '/log.txt' to store log and resume upload
        .then((res) => {
            console.log(res);
        })
        .catch(err => {
            console.log("Error :", err);
        });
}


function normalUpload() {
    console.log("Uploading normal");
    video(options) //
        .then((res) => {
            console.log(res);
        })
        .catch(err => {
            console.log("Error :", err);
        });
}
