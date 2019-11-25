const streamToPromise = require('stream-to-promise');
const rp = require('request-promise');
const fs = require('fs');

const url = 'https://graph-video.facebook.com';
// const url = 'http://localhost:7000';
const urlPath = 'advideos';
const version = 'v5.0';

const retryMax = 10;
let retry = 0;

function apiInit(args, videoSize) {
    const options = {
        method: 'POST',
        uri: `${url}/${version}/${args.id}/${urlPath}?access_token=${args.token}`,
        json: true,
        form: {
            upload_phase: 'start',
            file_size: videoSize
        }
    };

    return rp(options).then(res => res)
        .catch(err => err)
}

function apiFinish(args, upload_session_id, video_id) {
    console.log("\n Finished. ");
    const {token, id, stream, ...extraParams} = args;

    const options = {
        method: 'POST',
        json: true,
        uri: `${url}/${version}/${args.id}/${urlPath}`,
        formData: {
            ...extraParams,
            upload_session_id,
            access_token: args.token,
            upload_phase: 'finish',
        }
    };

    return rp(options)
        .then(res => ({...res, video_id}))
        .catch(err => err)

}

function uploadChunk(args, id, start, chunk) {
    const formData = {
        access_token: args.token,
        upload_phase: 'transfer',
        start_offset: start,
        upload_session_id: id,
        video_file_chunk: {
            value: chunk,
            options: {
                filename: 'chunk'
            }
        }
    };
    const options = {
        method: 'POST',
        uri: `${url}/${version}/${args.id}/${urlPath}`,
        formData: formData,
        json: true
    };

    return rp(options)
        .then(res => {
            retry = 0;
            console.log("\n Chunck Uploaded",res);
            return res
        })
        .catch(err => {
            console.log("\n Chunck Upload Error: ");
            // if (retry++ >= retryMax) {
            //     return err
            // }
            // return uploadChunk(args, id, start, chunk)
            throw new Error(err)
        })
}

function uploadChain(buffer, args, res, ids) {
    if (res.start_offset === res.end_offset) {
        return ids
    }
    console.log("Uploading");
    var chunk = buffer.slice(res.start_offset, res.end_offset);
    return uploadChunk(args, ids[0], res.start_offset, chunk)
        .then(res => uploadChain(buffer, args, res, ids))
}

function uploadChainForRetry(buffer, args, res, ids, retryPath) {
    // console.log("Session Id",ids && ids[0] ? ids[0]:'');
    // console.log("Video Id",ids && ids[1] ? ids[1]:'');
    if (res && res.statusCode && res.statusCode == 400) {
        throw new Error(res)
        // return res.name;
    } else if (res && res.end_offset) {
        if (res.start_offset === res.end_offset) {
            return ids
        }
        if(parseInt(res.start_offset)){
            console.count("\n Retrying Count ");
            console.log("\n Chunk Size :"+ res.start_offset);
            console.log("\n start_offset :"+ res.end_offset);
        } else if(res.end_offset){
            console.log("\n Chunk Size :", res.end_offset);
        } else {
        }
        res.ids = ids;
        res.args = args;
        let writeData = fs.writeFileSync(retryPath, JSON.stringify(res));
        var chunk = buffer.slice(res.start_offset, res.end_offset);
        return uploadChunk(args, ids[0], res.start_offset, chunk)
            .then(res => uploadChainForRetry(buffer, args, res, ids, retryPath))
    } else {
        throw new Error(res);
    }
}

function facebookApiVideoUpload(args, isRetry) {
    if (args && !isRetry) {
        return streamToPromise(args.stream)
            .then(buffer => Promise.all([buffer, apiInit(args, buffer.length)]))
            .then(([buffer, res]) => uploadChain(buffer, args, res, [res.upload_session_id, res.video_id]))
            .then(([id, video_id]) => apiFinish(args, id, video_id))
    } else if (args && isRetry && !isRetry.status && isRetry.path && isRetry.path) {
        let stream = fs.createReadStream(args.stream);
        return streamToPromise(stream)
            .then(buffer => Promise.all([buffer, apiInit(args, buffer.length)], isRetry))
            .then(([buffer, res]) => uploadChainForRetry(buffer, args, res, [res.upload_session_id, res.video_id], isRetry.path))
            .then(([id, video_id]) => apiFinish(args, id, video_id))
            .then(result => {2114141
                fs.unlinkSync(isRetry.path);
                return result
            })
    } else if (args && isRetry && isRetry.status && isRetry.path) {
        let stream = fs.createReadStream(args.stream);
        return streamToPromise(stream)
            .then(buffer => Promise.all([buffer, isRetry]))
            .then(([buffer, res]) => uploadChainForRetry(buffer, args, res, res.ids, isRetry.path))
            .then(([id, video_id]) => apiFinish(args, id, video_id))
            .then(result => {
                fs.unlinkSync(isRetry.path);
                return result
            })
    }
}

module.exports = facebookApiVideoUpload;