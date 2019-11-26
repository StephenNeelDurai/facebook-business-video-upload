# facebook-business-video-upload
##### Helping to upload video and image in facebook ad manager.
## Usage
# Video chunk upload
```js
const fs = require('fs');
const videoUploadEngine = require('facebook-business-video-upload').video;
 
const options = {
  token: "TOKEN",
  id: "ID", // page_id or user_id or event_id or group_id 
  stream: fs.createReadStream('./sample.mp4'), // Video file path,
  title: "test video",
  description: "test description"
};
 
videoUploadEngine(options)
      .then((response) => {
          console.log('\n **********************');
          console.log('\n Video Upload Result : ', response);  //  { success: true, video_id: '987654321' }
          console.log('\n **********************');
}).catch((error) => {
          console.error(error);
});

```
#### Want to resume if your process stopped in between upload ? try this...   
```js
const fs = require('fs');
const videoUploadEngine = require('facebook-business-video-upload').video;
 
const options = {
  token: "TOKEN",
  id: "ID", // page_id or user_id or event_id or group_id 
  stream: './sample.mp4', // Video file path, note: direct path only work if you give retry options!
  title: "test video",
  description: "test description"
};

let uploadCacheFilePath = path.join(__dirname, 'cache'); // Cache file folder to store cache data..
let uploadCacheFile = path.join(uploadCacheFilePath,`test_video_${Date.now()}.txt`); // create uniq name for cache file.
let uniqData = { id : 7, video_name : 'test video' }; // Uniq details about your video for future use.

let retryObj = {
 status: false, // It will false when uploading new one.
 path: uploadCacheFile, // Uniq file with dir path for store the cache data about your video upload.
 uniqId: null // You can pass any uniq data or json object about this video file. ex.video uniq id from db 
};

videoUploadEngine(options, retryObj)
      .then((response) => {
          console.log('\n **********************');
          console.log('\n Video Upload Result : ', response);  //  { success: true, video_id: '987654321' }
          console.log('\n **********************');
}).catch((error) => {
          console.error(error);
});

fs.readdir(uploadCacheFilePath, function (err, files) { // Reading dir to check any process pending in cache.
    console.log("\n Pending cache list", files);
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    if (files && files.length) { // If any file exist we can proceed to retry.
        files.forEach(function (file) {
            let readCacheFile = path.join(uploadCacheFilePath,file); // Adding file name with catch file path to read cache.
            fs.readFile(readCacheFile, (err, response) => {
                try {
                    let result = JSON.parse(response.toString()); // Parse data from cache.
                    if (checkValidRetryData(result)) { // Check any data missing for resume upload.
                    const options = {
                      token: result.args.token,
                      id: result.args.id, // page_id or user_id or event_id or group_id 
                      stream: result.args.stream // Video file path, note: direct path only work if you give retry options!
                    };
                    let retryObj = {
                     status: true, // It will true for retry this cache file.
                     path: readCacheFile, // Uniq file with dir path for store the cache data about your video upload.
                     uniqId: result.uniqId, // You can pass any uniq data or json object about this video file. ex.video uniq id from db
                     ids : result.ids,
                     start_offset : result.start_offset,
                     end_offset : result.end_offset
                    };
                     videoUploadEngine(options, retryObj)
                             .then((response) => {
                                 console.log('\n **********************');
                                 console.log('\n Video Retry Result : ', response);  //  { success: true, video_id: '987654321' }
                                 console.log('\n **********************');
                       }).catch((error) => {
                                 console.error(error);
                       });
                    } else {
                        console.log("Uniq Data Missing", result);
                    }
                } catch (err) {
                    console.log("\n Error : \n", err);
                }
            })
        })

    } else {
        console.log("\n No pending files to upload. Uploading New Video...");
    }
});
function checkValidRetryData(data) {
    return data && data.args && data.args.token && data.args.id && data.args.stream && data.ids && data.start_offset && data.end_offset;
}

```

# Image upload
```js
const fs = require('fs');
const imageUploadEngine = require('facebook-business-video-upload').image;

function imageTobase64(filePath) {
    // read binary data
    let bitmap = fs.readFileSync(filePath);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64'); // this may give warning. Now working on it    
    
}
const options = {
  token: "TOKEN",
  id: "ID", // page_id or user_id or event_id or group_id 
  bytes: imageTobase64('./test.jpg') // Image data in bytes (base64)
};
 
imageUploadEngine(options)
      .then((response) => {
          console.log('\n **********************');
          console.log('\n Image Upload Result : ', response);  //  { images: { hash: 'b4345sLKndf34245FDKLn', url:'https://scontent.xx.fbcdn.net/v/t21/32424545gf.jpg?cd=42&fdf=42' } } }
          console.log('\n **********************');
}).catch((error) => {
          console.error(error);
});
```
