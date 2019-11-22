const streamToPromise = require('stream-to-promise');
const rp = require('request-promise');

const url = 'https://graph.facebook.com';
// const url = 'http://localhost:7000';
const urlPath = 'adimages';
const version = 'v5.0';

const retryMax = 10;
let retry = 0;

function uploadImage(args) {
    return new Promise((resolve,reject)=> {
        const options = {
            method: 'POST',
            uri: `${url}/${version}/${args.id}/${urlPath}`,
            json: true,
            form: {
                bytes: args.bytes,
                access_token: args.token
            }
        };

        rp(options)
            .then(res => resolve(res))
            .catch(err => resolve(err))
    })
}

function facebookApiImageUpload(args) {
    return new Promise((resolve,reject)=>{
        uploadImage(args)
            .then((result)=>{
            console.log(result)
                resolve(result)
            })
            .catch((err)=>{
                console.error("Something Went Wrong!!!")
                resolve(err)
            })
        })
}

module.exports = facebookApiImageUpload;