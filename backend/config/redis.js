import { createClient } from "redis" ;
const rclient = createClient({
    url: process.env.REDIS_URL
});

rclient.on('error', (err) => {
    console.log('Redis Client Error', err);
});

await rclient.connect();

console.log("redis connected");
export default rclient;