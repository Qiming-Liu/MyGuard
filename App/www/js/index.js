let $firebase;
let $socket;
let $canvas
let $scan;
let $ble;
let $app;
let $sp;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    $firebase = new Firebase();
    $socket = new Socket();
    $canvas = new Canvas();
    $scan = new Scan();
    $ble = new Ble();
    $app = new App();
    $sp = new SP();
}