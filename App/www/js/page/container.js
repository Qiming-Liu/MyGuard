class Container {
    constructor() {
        this.component = {
            template: `
            <a-layout style="min-height: 100vh">
                <a-layout-sider v-model="collapsed" collapsible>
                    <a-affix :offset-top="0">
                        <a-menu theme="dark" :selectedKeys="[this.$route.path]" mode="inline">
                            <a-menu-item key="/container/home" v-on:click="to('/container/home')">
                                <a-icon type="home"></a-icon>
                                <span>Index</span>
                            </a-menu-item>
                            <a-menu-item key="/container/catch_image" v-on:click="to('/container/catch_image')">
                                <a-icon type="file-image"></a-icon>
                                <span>CatchImage</span>
                            </a-menu-item>
                            <a-menu-item key="/container/face_image" v-on:click="to('/container/face_image')">
                                <a-icon type="smile"></a-icon>
                                <span>FaceImage</span>
                            </a-menu-item>
                            <a-menu-item key="/container/camera" v-on:click="to('/container/camera')">
                                <a-icon type="video-camera"></a-icon>
                                <span>Camera</span>
                            </a-menu-item>
                            <a-menu-item key="/container/setting" v-on:click="to('/container/setting')">
                                <a-icon type="setting"></a-icon>
                                <span>Setting</span>
                            </a-menu-item>
                        </a-menu>
                    </a-affix>
                </a-layout-sider>
                <a-layout>
                    <a-affix :offset-top="0">
                        <a-layout-header align="center" style="background: #fff; padding: 0">
                            <img height="64px" src="img/logo2.png"/>
                        </a-layout-header>
                    </a-affix>
                    <a-layout-content style="margin: 0 16px">
                        <div id="content">
                            <router-view v-if="isRouterAlive" ></router-view>
                        </div>
                    </a-layout-content>
                    <a-layout-footer></a-layout-footer>
                </a-layout>
            </a-layout>
            `,
            provide() {
                return {
                    reload: this.reload
                }
            },
            data: function () {
                return {
                    collapsed: true,
                    isRouterAlive: true
                };
            },
            methods: {
                to(router) {
                    $app.vue.to(router);
                },
                reload() {
                    this.isRouterAlive = false;
                    this.$nextTick(() => {
                        this.isRouterAlive = true;
                    });
                },
            }
        }
        this.Home = {
            template: `
                <div>
                    <a-spin :spinning="loading" tip="Waiting Pi connection...">
                        <label>Raspberry Pi: &nbsp;&nbsp;
                            <a-tag color="#f50000" v-if="!connected">
                                Offline
                            </a-tag>
                            <a-tag color="#87d068" v-else>
                                Online
                            </a-tag>
                        </label>
                        <div style="margin-top: 16px">
                        CPU:
                        <div style="text-align:center">
                            <a-progress 
                                    status="active" 
                                    :percent="cpu_percent"
                                    :stroke-color="{'0%': '#260033','100%': '#1ee3cf'}">
                            </a-progress>
                        </div>
                        <a-card hoverable style="text-align:center;margin-top: 16px">
                            <a-progress
                                    type="circle"
                                    :stroke-color="{'0%': '#260033','100%': '#1ee3cf'}"
                                    :percent="mem_percent">
                            </a-progress>
                            <a-card-meta>
                                <template slot="title">
                                    <a-icon type="database" style="margin-top: 16px"></a-icon>&nbsp;&nbsp;Memory
                                </template>
                            </a-card-meta>
                        </a-card>
                        <a-card hoverable style="text-align:center;margin-top: 16px">
                            <a-progress
                                    type="circle"
                                    :stroke-color="{'0%': '#260033','100%': '#1ee3cf'}"
                                    :percent="disk_percent">
                            </a-progress>
                            <a-card-meta>
                                <template slot="title">
                                    <a-icon type="hdd" style="margin-top: 16px"></a-icon>&nbsp;&nbsp;Disk
                                </template>
                            </a-card-meta>
                        </a-card>
                    </div>
                    </a-spin>
                </div>
            `,
            inject: ['reload'],
            data: function () {
                return {
                    connected: false,
                    cpu_percent: 0,
                    mem_percent: 0,
                    disk_percent: 0,
                    memory: '',
                    disk: '',
                    loading: true,
                    si: ''
                };
            },
            mounted() {
                this.connected = $socket.connected;
                if (this.connected) {
                    this.loading = false;
                }
                this.si = setInterval(() => {
                    $socket.connect(this, () => {
                        clearInterval(this.si);
                        this.loading = false;
                        this.getStats();
                    });
                }, 1000);
            },
            methods: {
                perToNum(percent) {
                    return Number(percent.replace('%', ''));
                },
                getStats() {
                    $socket.con.emit('status', (res) => {
                        this.cpu_percent = this.perToNum(res.cpu_percent);
                        this.mem_percent = this.perToNum(res.mem_percent);
                        this.disk_percent = this.perToNum(res.disk_percent);
                        this.getStats();
                    });
                },
            },
        };
        this.Catch_image = {
            template: `
                <div>
                    <a-empty :description="false" v-if="imageList.length === 0"></a-empty>
                    <div v-else>
                        <a-card hoverable v-for="item in imageList" :key="item.url" style="margin-top: 16px">
                            <a-card-meta :title="toDate(item.sort)"></a-card-meta>
                            <div slot="cover">
                                <a-spin :spinning="loading[item.url]" tip="Pose estimating...">
                                    <canvas :id="item.url" style="display: none" width="262" height="197"></canvas>
                                    <img :src="item.url" v-on:click="pose" width="262" height="197"/>
                                </a-spin>
                            </div>
                        </a-card>
                    </div>
                </div>
            `,
            data: function () {
                return {
                    imageList: [],
                    loading: {}
                };
            },
            methods: {
                getList() {
                    if ($socket.connected) {
                        $socket.con.emit('catch_images', $socket.url(), (res) => {
                            if (res.imageList.length !== this.imageList.length) {
                                this.imageList = res.imageList;
                                for (let i = 0; i < this.imageList.length; i++) {
                                    if (this.loading[this.imageList[i].url] === undefined) {
                                        this.loading[this.imageList[i].url] = false;
                                    }
                                }
                            }
                        });
                    }
                },
                pose(e) {
                    let canvas = document.getElementById(e.target.currentSrc);
                    let image = e.target;
                    $canvas.setup(canvas, image);
                    $canvas.estimate(canvas, image, e.target.currentSrc, this.loadPose);
                },
                loadPose(url) {
                    this.loading[url] = !this.loading[url];
                },
                toDate(time){
                    return new Date(new Date(time*1000)).toString().substr(0,24);
                }
            },
            created() {
                this.getList();
                setInterval(() => {
                    this.getList();
                }, 1000);
            },
        }
        this.Face_image = {
            template: `
                <div>
                    <a-empty :description="false" v-if="imageList.length === 0"></a-empty>
                    <div v-else>
                        <a-card hoverable v-for="item in imageList" :key="item.url" style="margin-top: 16px">
                            <a-card-meta :title="toDate(item.sort)"></a-card-meta>
                            <div slot="cover">
                                <a-spin :spinning="loading[item.url]" tip="Pose estimating...">
                                    <canvas :id="item.url" style="display: none" width="262" height="197"></canvas>
                                    <img :src="item.url" v-on:click="pose" width="262" height="197"/>
                                </a-spin>
                            </div>
                        </a-card>
                    </div>
                </div>
            `,
            data: function () {
                return {
                    imageList: [],
                    loading: {}
                };
            },
            methods: {
                getList() {
                    if ($socket.connected) {
                        $socket.con.emit('face_images', $socket.url(), (res) => {
                            if (res.imageList.length !== this.imageList.length) {
                                this.imageList = res.imageList;
                                for (let i = 0; i < this.imageList.length; i++) {
                                    if (this.loading[this.imageList[i].url] === undefined) {
                                        this.loading[this.imageList[i].url] = false;
                                    }
                                }
                            }
                        });
                    }
                },
                pose(e) {
                    let canvas = document.getElementById(e.target.currentSrc);
                    let image = e.target;
                    $canvas.setup(canvas, image);
                    $canvas.estimate(canvas, image, e.target.currentSrc, this.loadPose);
                },
                loadPose(url) {
                    this.loading[url] = !this.loading[url];
                },
                toDate(time){
                    return new Date(new Date(time*1000)).toString().substr(0,24);
                }
            },
            created() {
                this.getList();
                setInterval(() => {
                    this.getList();
                }, 1000);
            },
        }
        this.Camera = {
            template: `
                <img id="img" v-bind:src="url" width="100%">
            `,
            data: function () {
                return {
                    url: $socket.url() + '/camera/-1'
                };
            }
        }
        this.Setting = {
            template: `
                <div>
                    <a-alert message="User info:" type="success">
                    </a-alert>
                    <a-alert
                            :message="user.email"
                            :description="user.uid"
                    ></a-alert>
                    <a-button type="danger" block style="margin-top: 24px;" @click="reset" block>
                        Reset
                    </a-button>
                    <a-button type="danger" block style="margin-top: 24px;" @click="signOut" block>
                        Sign out
                    </a-button>
                </div>
            `,
            data: function () {
                return {
                    user: $firebase.getUser()
                };
            },
            methods: {
                reset() {
                    $firebase.removeLink($firebase.getUser().uid, () => {
                        this.signOut();
                    });
                },
                signOut() {
                    $firebase.signOut(() => {
                        $sp.delete('uid');
                        navigator.app.restartApp();
                    });
                }
            },
        };
    }
}