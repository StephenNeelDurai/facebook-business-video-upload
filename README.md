# facebook-business-video-upload
##### Helping to upload video in facebook ad manager.
## Usage
# Video upload
```js
const fs = require('fs');
const uploadEngine = require('facebook-business-video-upload').video;
 
const options = {
  token: "TOKEN",
  id: "ID", // page_id or user_id or event_id or group_id 
  stream: fs.createReadStream('./sample.mp4'), // Video file path,
  title: "test video",
  description: "test description"
};
 
uploadEngine(options).then((response) => {
  console.log('\n **********************');
  console.log('\n Result : ', response);  //  { success: true, video_id: '987654321' }
  console.log('\n **********************');
}).catch((error) => {
  console.error(error);
});
```
