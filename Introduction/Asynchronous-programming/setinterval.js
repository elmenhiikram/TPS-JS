function run() {
  console.log("hello");
  setTimeout(run, 1000);
}

setTimeout(run, 1000);
