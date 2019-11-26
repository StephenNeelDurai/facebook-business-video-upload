# facebook-business-video-upload
##### Helping to upload video and image in facebook ad manager.
## Usage
# Video upload
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
