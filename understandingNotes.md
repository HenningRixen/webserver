# Understanding notes

## Tcp Quick

- different Layers
- Tcp / Udp above ip layer
- Tcp continuios flow of bytes
  -> means also mulitple request in one byte flow instead of just one
- certain lentght of bytes is always some kind of information in the stream
  -> simplest example of an application protocol

## Socket Promitives

### Listening Socket

- listenst to ip + port and accepts or declines connection
- bind & listen
- accept
- close

### Connection Socket

- after acepting
- read
- write
- close

### Half Open Connection

- is not really used needs a flag in js
- connection where one closed connection but the other didnt
- A can still send B but B cant send A

### Event Loop Concurrency

- js code and runtime share single os thread
- if multiple request come in they cant be handled parallel
- only conccurent not parallel

### Promises vs Callback

- callback blocks and says do this function some time when i need it
- promise returns promise imedeatly and frees callstack result doesnt
need to be there,the program executes syncronysly
again and does the stuff after promise
- when awaited, then it pauses only async function to get a result
- so when multiple connections come in, the program could handle it with async functions
- the call stack would just push an event if the async function is awaited
and does the stop then, but unless that is the case everthing still runs

### javascript knowledge

- javascript die sprache, V8 von google führt sie aus in nodejs der ihr
fähigkeiten außerhalb des browsers gibt
wie readFile und http usw (also außerhalb des doms)
- call stack: was gerade ausgeführt wird
- Queue: Was später ausgeführt werden soll
- Event Loop: Schiebt fertige Aufgaben vom Warteraum in die Ausführung

```
console.log("Start");

setTimeout(() => {
  console.log("Timer");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise");
});
console.log("Ende");
```

- Ausgabe davon:
  - Start
  - Ende
  - Promise
  - Timer
- Also Syncrone sachen zu erst, Dann Promises/Callback(Mikrotask), dann Timer Callbacks(Makrotask)
- Meist zuerst mikrotasks, dann nächste großere aufgabe

#### Callback

- Callback: Ergebnis wird mit callback(ergebnis) übergeben

```

//callback mit ergebnis
function addiere(a: number, b: number, callback: (add: number) => void) {
  const add = a + b
  callback(add)
}

addiere(2, 4, (add) => {
  console.log(`Ergebnis ${add}`)
})
```

- error firs callback also der callback muss quasi nach einem fehler überprüft werden
und der callback muss diesen auch explizit ausgeben

#### Promise

- das ergebnis wird mit resolve(ergebnis) übergeben und dann im then gefangen
- promises angehnehmer als callbacks, wegen der verschachtelung

## Tcp

- hat listen der quasi auf neue verbindungen wartet,
und dann eine connection erstellt asyncron und die dann conncurrent ist
- danach kehrt listen zurück für neue verbindungen
- also 1 zu n

## Excurs Bytemanipulation in js

- todo hier mal damit beschäftigen

## Pipelining requests

- reduziert latency weil man als client theoretisch meherere requests über eine
verbindung schicken kann und der server das dann abarbeiten kann
- eigentlich ist tcp nur bytestream aber hat dann halt bestimmte breakpoints
- zu viele requests kann aber bei pipelining in deadlock führen

## Http

- header und body über /n/r/n/r getrennt
- relevant sind length vom header und vom body
  - If Transfer-Encoding: chunked is present. Parse chunks. hier werden
  einfach vor die bytes die größe des chunks geschrieben. 0 größe ist ende
  - If Content-Length: number is valid. The length is known.
  - If neither field is present, use the rest of the connection data as the payload.
