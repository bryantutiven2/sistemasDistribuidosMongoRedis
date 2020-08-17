const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

var redisHost = 'redis-15206.c85.us-east-1-2.ec2.cloud.redislabs.com';
var redisPort = '15206';
var redisAuth = 'xjy9EWPadLfZvqsJvoEU7SbWRk4DFWSx';

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient({
    port : redisPort,
    host : redisHost
});
client.auth(redisAuth, function(err, response){
    if(err){
    throw err;
    }
});

client.hget = util.promisify(client.hget);   
mongoose.Query.prototype.cache = function(hkey){
    this.useCache = true;

    this.hashkey = JSON.stringify(hkey || '')

    return this;
}

const exec = mongoose.Query.prototype.exec 

mongoose.Query.prototype.exec = async function(){ 
    if(!this.useCache){
        return exec.apply(this, arguments)
    }

    let key = JSON.stringify(Object.assign({},this.getQuery(),{collection: this.mongooseCollection.name}));
    const cacheValue = await client.hget(this.hashkey, key)
    
    if(cacheValue){
        const doc = JSON.parse(cacheValue)
        console.log("Response from Redis");  
        return  Array.isArray(doc)
                ? doc.map((d)=>new this.model(d))
                : new this.model(doc);
    }
    else{
        console.log("Response from MongoDB");
    }

    const result = await exec.apply(this, arguments)
    if(result){ 
        if(Array.isArray(result) && result.length==0){
            return null
        }
        else{
            client.hset(this.hashkey, key, JSON.stringify(result));
            return result
        }
    }else{ 
        console.log("data not present")
        return null
    } 
}

module.exports = 
    function clearCache(hashkey){
        client.del(JSON.stringify(hashkey))
    }