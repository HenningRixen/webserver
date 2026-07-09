"use strict";
// callback verzögert
/*console.log("A")
setTimeout(() => { log("B") }, 1000)
console.log("C")

function log(text: string) {
  console.log(text)

}*/
//callback 
/*function begruesse(name: string, callback: () => void) {
  console.log(`Hallo ${name}`)
  callback()
}

begruesse("Max", () => {
  console.log("callback ausgeführt")
})
console.log("na")*/
//callback mit ergebnis
/*function addiere(a: number, b: number, callback: (add: number) => void) {
  const add = a + b
  callback(add)
}

addiere(2, 4, (add) => {
  console.log(`Ergebnis ${add}`)
})*/
//asynchroner Callback
/*function warteUndSagHallo(callback: () => void) {
  return setTimeout(() => {
    callback()
  }, 2000)
}

warteUndSagHallo(() => { console.log("Hello") })

console.log("ich zuerst")*/
//erstes Promise
/*1. Promise wird erstellt.
2. setTimeout wird gestartet.
3. Promise ist erstmal pending.
4. Nach 1 Sekunde wird resolve("fertig") ausgeführt.
5. .then(...) bekommt den Wert "fertig".
6. console.log(wert) gibt "fertig" aus.*/
/*const erstesPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("fertig")
  }, 1000)
})

erstesPromise.then((wert) => {
  console.log(wert)
})*/
//promise mit Fehler
/*const promiseMitFehler = new Promise((_resolve, reject) => {
  setTimeout(() => {
    reject("klappt nicht halt")
  }, 1000)
})

promiseMitFehler.then((wert) => console.log(wert)).catch((fehler) => {
  console.log(fehler)
})*/
//Promise Kette
/*const promise = new Promise((resolve, _reject) => {
  resolve(5)
})

promise.then((wert) => {
  if (typeof wert === "number") {
    return wert * 2
  }
}).then((wert) => {
  if (typeof wert === "number") {
    return wert + 3
  }
}).then((wert) => {
  console.log(wert)
})*/
// umbauen in promise
/*function ladeDaten(callback) {
  setTimeout(() => {
    callback("Daten geladen");
  }, 1000);
}

ladeDaten((daten) => {
  console.log(daten);
});*/
function ladeDaten() {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve("Daten");
        }, 1000);
    });
}
ladeDaten().then((daten) => {
    console.log(daten);
});
