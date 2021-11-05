class Scan {
    constructor() {
        this.component = {
            template: `
            <div id="scan">
                <div class="h-screen overflow-hidden flex items-center justify-center">
                    <div class="flex w-full flex-row justify-between items-center mb-2 px-2 text-gray-50 z-10 absolute top-4">
                        <div class="flex flex-row items-center ">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 class="h-8 w-8 p-2 cursor-pointer hover:bg-gray-500 text-gray-50 rounded-full mr-3" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" onclick="$app.$scan.cancel()">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            <span class="text-sm">QR Code</span>
                        </div>
                    </div>
                    <div class="text-center z-10">
                        <div class="">
                            <div class="relative border-corner p-5 m-auto rounded-xl bg-cover w-48 h-48 flex "
                                 style="background-color:transparent;">
                                <span class="border_bottom"></span>
                            </div>
                        </div>
                        <p class="text-gray-300 text-xs mt-3">Scan a QR Code</p>
                        <div class="mt-5 w-full flex items-center justify-between space-x-3 my-3 absolute bottom-0 left-0 px-2">
                            <div class="flex ">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     class="h-8 w-8 p-2 cursor-pointer hover:bg-gray-600 text-gray-50 rounded-full "
                                     viewBox="0 0 20 20" fill="currentColor" onclick="$app.$scan.light()">
                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                                </svg>
                            </div>
                            <div class="ml-0">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     class="h-8 w-8 p-2 cursor-pointer hover:bg-gray-600 text-gray-50 rounded-full "
                                     viewBox="0 0 20 20" fill="currentColor" onclick="$app.$scan.reversal()">
                                    <path fill-rule="evenodd"
                                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `,
            destroyed() {
                QRScanner.cancelScan();
                QRScanner.destroy();
            },
        }
        this.triedTime = 0;
        this.cancelLink = '/'
    }

    start(cancelLink, callback) {
        this.cancelLink = cancelLink;
        document.body.style.setProperty('background-color', 'transparent', 'important');
        QRScanner.prepare((err, status) => {
            if (err) {
                console.error(err);
            }
            if (status.authorized) {
                document.body.style.setProperty('background-color', 'transparent', 'important');
                QRScanner.scan((err, text) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(text);
                        $app.vue.to(cancelLink);
                        callback(text);
                    }
                    QRScanner.destroy();
                });
                QRScanner.show();
            } else if (status.denied) {
                QRScanner.openSettings();
            } else {
                if ($app.$scan.triedTime > 2) {
                    QRScanner.openSettings();
                } else {
                    $app.$scan.triedTime++;
                    $app.$scan.prepare();
                }
            }
        });
    }

    light() {
        QRScanner.getStatus(function (status) {
            if (status.lightEnabled) {
                QRScanner.disableLight(function (err, status) {
                    err && console.error(err);
                });
            } else {
                QRScanner.enableLight(function (err, status) {
                    err && console.error(err);
                });
            }
        });
    }

    reversal() {
        QRScanner.getStatus(function (status) {
            if (status.currentCamera === 0) {
                QRScanner.useFrontCamera(function (err, status) {
                    err && console.error(err);
                });
            } else {
                QRScanner.useBackCamera(function (err, status) {
                    err && console.error(err);
                });
            }
        });
    }

    cancel() {
        QRScanner.cancelScan();
        $app.vue.to(this.cancelLink);
    }
}