class Welcome {
    constructor() {
        this.component = {
            template: `
            <a-layout>
                <a-layout-header align="center" style="background: #fff; padding: 0">
                    <img height="64px" src="img/logo2.png"/>
                </a-layout-header>
                <a-layout-content style="margin: 0 16px">
                    <div id="content">
                        <div class="steps-content">
                            <a-card style="max-height: 42vh">
                                <router-view></router-view>
                            </a-card>
                        </div>
                        <a-steps :current="current" style="margin-top: 16px">
                            <a-step v-for="item in steps" :key="item.title" :title="item.title" :description="item.description"></a-step>
                        </a-steps>
                    </div>
                </a-layout-content>
                <a-layout-footer></a-layout-footer>
            </a-layout>
            `,
            data() {
                return {
                    current: 0,
                    steps: [
                        {
                            title: 'Login',
                            description: 'Login first to bind Pi.',
                        },
                        {
                            title: 'Scan',
                            description: 'Scan the QR code.',
                        },
                        {
                            title: 'Sensor',
                            description: 'Add sensor.',
                        },
                        {
                            title: 'Wi-Fi',
                            description: 'Connect Wi-Fi.',
                        },
                    ],
                };
            },
            created() {
                this.$root.$on('step', num => {
                    this.current = num;
                });
            }
        }
        this.Login = {
            template: `
                <div id="firebase"></div>
            `,
            created() {
                this.$root.$emit('step', 0);
            },
            mounted() {
                this.$nextTick(()=>{
                    $sp.get('uid', uid => {
                        if (uid === undefined) {
                            this.init();
                        } else {
                            $firebase.hasLink(uid, has => {
                                if (has) {
                                    $app.vue.to('/container/home');
                                } else {
                                    $sp.delete('uid');
                                    this.init();
                                }
                            });
                        }
                    });
                });
            },
            methods: {
                init() {
                    $firebase.loginInit((authResult, redirectUrl) => {
                        let uid = $firebase.getUser().uid;
                        $sp.put('uid', uid);
                        $firebase.hasLink(uid, has => {
                            if (has) {
                                $app.vue.to('/container/home');
                            } else {
                                $app.vue.to('/welcome/scan');
                            }
                        });
                    });
                }
            }
        }
        this.Scan = {
            template: `
            <div>
                <a-card-meta title="Device ID:">
                    <template slot="description">
                        <a-input allow-clear v-model="id"></a-input>
                    </template>
                </a-card-meta>
                <a-button type="default" block style="margin-top: 24px;" @click="scan">
                    Start Scan
                </a-button>
                <a-button type="primary" block style="margin-top: 24px;" @click="confirm">
                    Confirm
                </a-button>
            </div>
            `,
            created() {
                this.$root.$emit('step', 1);
                this.id = $device_id;
            },
            data() {
                return {
                    id: ''
                }
            },
            methods: {
                scan() {
                    $app.vue.to('/scan');
                    $app.$scan.start('/welcome/scan', text => {
                        if (text.startsWith('https://myguard-9a9cb.web.app/shorturl.html?id=')) {
                            let id = text.substring(text.indexOf('id=')).substring(3);
                            $device_id = id.substring(0, 6);
                            $sensor_id = id.substring(6, 12);
                            this.id = $device_id;
                        } else {
                            $app.toast("Incorrect device id!");
                        }
                    });
                },
                confirm() {
                    if ($device_id !== '' && $device_id.length === 6) {
                        $app.vue.to('/welcome/sensor');
                    } else {
                        $app.toast("Incorrect device id!");
                    }
                }
            }
        }
        this.Sensor = {
            template: `
            <div>
                <a-card-meta title="Sensor ID:">
                    <template slot="description">
                        <a-input allow-clear v-model="id"></a-input>
                    </template>
                </a-card-meta>
                <a-button type="default" block style="margin-top: 24px;" @click="scan">
                    Start Scan
                </a-button>
                <a-button type="primary" block style="margin-top: 24px;" @click="confirm">
                    Confirm
                </a-button>
            </div>
            `,
            created() {
                this.$root.$emit('step', 2);
                this.id = $sensor_id;
            },
            data() {
                return {
                    id: ''
                }
            },
            methods: {
                scan() {
                    $app.vue.to('/scan');
                    $app.$scan.start('/welcome/sensor', text => {
                        if (text.startsWith('https://myguard-9a9cb.web.app/shorturl.html?id=')) {
                            let id = text.substring(text.indexOf('id=')).substring(3);
                            $device_id = id.substring(0, 6);
                            $sensor_id = id.substring(6, 12);
                            this.id = $sensor_id;
                        } else if (text.length === 6) {
                            $sensor_id = text;
                            this.id = $sensor_id;
                        } else {
                            $app.toast("Incorrect sensor id!");
                        }
                    });
                },
                confirm() {
                    if ($sensor_id !== '' && $sensor_id.length === 6) {
                        $app.vue.to('/welcome/wifi');
                    } else {
                        $app.toast("Incorrect sensor id!");
                    }
                },
            }
        }
        this.Wifi = {
            template: `
            <div>
                <a-alert :type="alert.error" :message="alert.text" banner></a-alert>
                <a-alert type="info" :message="alert.label" banner style="margin-top: 8px"></a-alert>
                <a-form :form="form" @submit="handleSubmit" style="margin-top: 16px">
                    <a-form-item :validate-status="wifissidError ? 'error' : ''" :help="wifissidError || ''">
                        <a-input
                                v-decorator="['SSID',{ rules: [{ required: true, message: 'Please input the Wi-Fi SSID!' }] },]"
                                placeholder="SSID">
                            <a-icon slot="prefix" type="wifi" style="color:rgba(0,0,0,.25)"/>
                        </a-input>
                    </a-form-item>
                    <a-form-item :validate-status="passwordError() ? 'error' : ''" :help="passwordError() || ''">
                        <a-input
                                v-decorator="['password',{ rules: [{ required: true, message: 'Please input Wi-Fi Password!' }] },]"
                                type="password"
                                placeholder="Password">
                            <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)"></a-icon>
                        </a-input>
                    </a-form-item>
                    <a-form-item>
                        <a-button :type="button.type" html-type="submit" block :loading="button.loading">
                            {{ button.text }}
                        </a-button>
                    </a-form-item>
                </a-form>
            </div>
            `,
            created() {
                this.$root.$emit('step', 2);
            },
            data() {
                return {
                    form: this.$form.createForm(this, {name: 'wifi'}),
                    alert: {
                        type: 'warning',
                        text: 'Waiting for Bluetooth connection.',
                        label: 'Input Wi-Fi.',
                    },
                    button: {
                        type: 'primary',
                        text: 'Connect',
                        loading: true
                    },
                    time: 0,
                    subID: []
                };
            },
            mounted() {
                $firebase.getData('device_map/' + $device_id, rsa_device_id => {
                    this.subID = rsa_device_id.match(/.{1,11}/g);
                    this.$nextTick(() => {
                        this.form.validateFields((err, values) => {
                            $ble.start(this.subID.length + '', (error) => {
                                $app.toast('Bluetooth error.');
                                $app.vue.to('/welcome/sensor');
                                console.log('BLE:' + error);
                            }, (channel, value) => {
                                this.button.loading = false;
                                console.log([channel, value]);
                                if (channel === $ble.WRITE_STATUS_UUID) {
                                    switch (value) {
                                        case '01': {
                                            this.alert = {
                                                type: 'info',
                                                text: 'Bluetooth connected.',
                                                label: 'Waiting for input.'
                                            }
                                            break;
                                        }
                                        case '02': {
                                            this.alert = {
                                                type: 'warning',
                                                text: 'Connecting...',
                                                label: 'Please check if it takes too long.'
                                            }
                                            break;
                                        }
                                        case '03': {
                                            this.button = {
                                                type: 'primary',
                                                text: 'Connected',
                                                loading: true
                                            }
                                            this.alert = {
                                                type: 'success',
                                                text: 'Wi-Fi connected',
                                                label: 'Please enjoy.'
                                            }
                                            setTimeout(() => {
                                                $app.vue.to('/container/home');
                                            }, 2000);
                                            break;
                                        }
                                        default: {
                                            console.log([channel, value]);
                                        }
                                    }
                                } else if (channel === $ble.WRITE_DEVICE_ID) {
                                    try {
                                        let i = parseInt(value);
                                        if (i < this.subID.length) {
                                            // 0 = not end 1 = end
                                            let mark = i === this.subID.length - 1 ? 1 : 0;
                                            let index = '0' + i;
                                            let data = mark + index.substr(index.length - 2) + this.subID[i];
                                            // value = 0 (mark) 01 (index) string (data) FF (CRC8)
                                            $ble.updateValue($ble.READ_DEVICE_ID, (data + $ble.crc(data)), () => {
                                            });
                                        }
                                    } catch (e) {
                                    }
                                } else if (channel === $ble.WRITE_SERIAL_ID) {
                                    //register device
                                    $firebase.setData('device/' + value, {
                                        deviceid: $device_id,
                                        sensorid: $sensor_id,
                                        userid: $firebase.getUser().uid
                                    });
                                } else {
                                    console.log("ERROR: BLE no handler");
                                }
                            });
                        });
                    });
                });
            },
            destroyed() {
                $ble.stop();
            },
            methods: {
                wifissidError() {
                    const {getFieldError, isFieldTouched} = this.form;
                    return isFieldTouched('SSID') && getFieldError('SSID');
                },
                passwordError() {
                    const {getFieldError, isFieldTouched} = this.form;
                    return isFieldTouched('password') && getFieldError('password');
                },
                handleSubmit(e) {
                    e.preventDefault();
                    this.form.validateFields((err, values) => {
                        if (!err) {
                            this.button = {
                                type: 'primary',
                                text: 'Connecting...',
                                loading: true
                            }
                            $ble.updateWiFi(values.SSID, values.password, () => {
                                this.times++;
                                $ble.updateValue($ble.READ_STATUS_UUID, 'update' + this.times, () => {
                                    setInterval(() => {
                                        this.button = {
                                            type: 'primary',
                                            text: 'Retry',
                                            loading: false
                                        }
                                    }, 2000);
                                });
                            });
                        }
                    });
                },
            },
        }
    }
}