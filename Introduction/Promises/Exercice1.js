console.log("Program Started");

const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, 3000);
});

console.log(myPromise);
console.log("Program in progress...");

myPromise.then(() => {
    console.log("Program complete");
});
