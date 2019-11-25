const streamToPromise = require('stream-to-promise');
const rp = require('request-promise');
const fs = require('fs');

// const url = 'https://graph-video.facebook.com';
const url = 'http://localhost:7000';
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
    console.log("Finished");
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
            return res
        })
        .catch(err => {
            if (retry++ >= retryMax) {
                return err
            }
            return uploadChunk(args, id, start, chunk)
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
    console.log("\n Chunk Size", res.end_offset);
    if (res.start_offset === res.end_offset) {
        return ids
    }
    res.ids = ids;
    res.args = args;
    let writeData = fs.writeFileSync(retryPath, JSON.stringify(res));
    var chunk = buffer.slice(res.start_offset, res.end_offset);
    return uploadChunk(args, ids[0], res.start_offset, chunk)
        .then(res => uploadChainForRetry(buffer, args, res, ids, retryPath))
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
            .then(result => {
                fs.unlinkSync(isRetry.path);
                return result
            })
    } else if (args && isRetry && isRetry.status && isRetry.path) {
        let stream = fs.createReadStream(args.stream);
        return streamToPromise(stream)
            .then(buffer => Promise.all([buffer, isRetry]))
            .then(([buffer, res]) => uploadChainForRetry(buffer, args, res, [res.ids[0], res.ids[1]], isRetry.path))
            .then(([id, video_id]) => apiFinish(args, id, video_id))
            .then(result => {
                fs.unlinkSync(isRetry.path);
                return result
            })
    }
}

module.exports = facebookApiVideoUpload;