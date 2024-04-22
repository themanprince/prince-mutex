//chatgpt gave me a nonsense mutex implementation so I had to completely design one from scratch
//even if it slowed down my project by a day...
//Is this the AI thats supposed to take my job? lol

class Mutex {

	#promiseQueue;
	#checkerFuncQueue;
	#isFree;
	
	constructor() {
		this.#promiseQueue = [];
		this.#checkerFuncQueue = [];
		this.#isFree = true;
	}
	
	#createChecker = (index, resolve) => () => {
		let nextCheckerFunc;
		if(!! (nextCheckerFunc = this.#checkerFuncQueue[index + 1]))
			resolve(nextCheckerFunc);
		else {
			this.#isFree = true;
			resolve(null);
		}
	}
	
	#createPromiseAndChecker() {
		//In my own words...
		//"putting these statements in a function creates some form of transaction... since the function'll be put in a stack and there can be no context switching... stacks have to be LIFO"
		let promiseResolveRef;
		const thePromise = new Promise(resolve => {
			promiseResolveRef = resolve;
		});
		this.#promiseQueue.push(thePromise);
		const promiseIndex = this.#promiseQueue.length - 1;
	
		const checkerIndexToInsert = this.#checkerFuncQueue.length;
		const checkerFunc = this.#createChecker(checkerIndexToInsert, promiseResolveRef);
		this.#checkerFuncQueue.push(checkerFunc);
			
		return {
			checkerFunc,
			promiseIndex
		};
	}
	
	async lock() {
		if(this.#isFree) {
			this.#isFree = false;
			return this.#createPromiseAndChecker()["checkerFunc"];
		} else {
			const {checkerFunc, promiseIndex} = this.#createPromiseAndChecker();
			return await this.#promiseQueue[promiseIndex - 1];
		}
	}
}

module.exports = Mutex;

//testing out
/*const mutex = new Mutex();

async function test0() {
	console.log(`in test0, before locking mutex`);
	const release = await mutex.lock();
	console.log(`test0 just obtained mutex lock`);
	await new Promise(resolve => setTimeout(resolve, 2000));
	console.log(`just finished running test0 long shi... releasing mutex`);
	release();
}
async function test1() {
	console.log(`in test1, before locking mutex`);
	const release = await mutex.lock();
	console.log(`test1 just obtained mutex lock`);
	await new Promise(resolve => setTimeout(resolve, 2000));
	console.log(`just finished running test1 long shi... releasing mutex`);
	release();
}
async function test2() {
	console.log(`in test2, before locking mutex`);
	const release = await mutex.lock();
	console.log(`test2 just obtained mutex lock`);
	await new Promise(resolve => setTimeout(resolve, 2000));
	console.log(`just finished running test2 long shi... releasing mutex`);
	release();
}
async function test3() {
	console.log(`in test3, before locking mutex`);
	const release = await mutex.lock();
	console.log(`test3 just obtained mutex lock`);
	await new Promise(resolve => setTimeout(resolve, 2000));
	console.log(`just finished running test3 long shi... releasing mutex`);
	release();
}

test0();
test1();
test2().then(() => {
	test1()
	test3();
	test3().then(() => {
		test1()
		test3();
	});
});*/