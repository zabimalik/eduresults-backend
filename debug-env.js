import dotenv from "dotenv";
dotenv.config();

console.log("Loaded Environmental Variables Keys:");
const keys = Object.keys(process.env).filter(key => !['PATH', 'OS', 'Path', 'SHELL'].includes(key)); // Filter out some noisy system ones if needed, but for now showing all might be safer to find typos.
console.log(keys);

if (process.env.MONGO_URI) {
    console.log("MONGO_URI is set (length: " + process.env.MONGO_URI.length + ")");
} else {
    console.log("MONGO_URI is NOT set");
}
