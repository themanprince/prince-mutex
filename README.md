##Example Usage

const Mutex = require("prince-mutex");

const mutex = new Mutex();  
const release = await mutex.lock();  
//code for accessing critical section  
//releasing mutex afterwards  
release();  