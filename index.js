const Airtable = require("airtable");

Airtable.configure({
  apiKey: "",
});
const base = Airtable.base("app4zUTTOqIPZts1C");

const table = base("BTC table");
let waitingQueue = [];
const request = require("request");
// return the btc cuurent btc value
function BTC() {
  return new Promise((resolve) => {
    request("https://blockchain.info/de/ticker", (error, response, body) => {
      const data = JSON.parse(body);
      value = parseInt(data.USD.last);
      resolve(value);
    });
  });
}
//call the btc function
function callBTC() {
  reloadWaitingQueue();
  BTC().then((val) => updateTable(new Date(), val, "failUpdateTable"));
}
// try to reload the waiting queue
function reloadWaitingQueue() {
  len = waitingQueue.length;
  while (len != 0) {
    let currValue = waitingQueue[0];
    updateTable(currValue[0], currValue[1]);
    if (waitingQueue.length === len) break;
  }
}
//create value in the table
function updateTable(time, rates, err) {
  table.create(
    [
      {
        fields: {
          Time: time,
          Rates: rates,
        },
      },
    ],
    function (error, Record) {
      if (error) {
        err === "failUpdateTable" && waitingQueue.push([new Date(), val]);
      } else {
        waitingQueue.shift();
      }
    }
  );
}
setInterval(callBTC, 60000);
