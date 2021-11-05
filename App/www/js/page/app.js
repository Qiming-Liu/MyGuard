class App {
    constructor() {
        //page
        this.$welcome = new Welcome();
        this.$container = new Container();
        this.$scan = new Scan();
        //router
        this.router = new VueRouter({
            routes: [
                {path: '/', redirect: '/welcome'},
                {
                    path: '/welcome', component: this.$welcome.component, children: [
                        {path: '', redirect: 'login'},
                        {path: 'login', component: this.$welcome.Login},
                        {path: 'scan', component: this.$welcome.Scan},
                        {path: 'sensor', component: this.$welcome.Sensor},
                        {path: 'wifi', component: this.$welcome.Wifi},
                    ]
                },
                {
                    path: '/container', component: this.$container.component, children: [
                        {path: '', redirect: 'home'},
                        {path: 'home', component: this.$container.Home},
                        {path: 'camera', component: this.$container.Camera},
                        {path: 'catch_image', component: this.$container.Catch_image},
                        {path: 'face_image', component: this.$container.Face_image},
                        {path: 'setting', component: this.$container.Setting},
                    ]
                },
                {path: '/scan', component: this.$scan.component},
            ]
        });
        //vue
        this.vue = new Vue({
            router: this.router,
            methods: {
                to(path) {
                    if (this.$route.path !== path) {
                        this.$router.push(path);
                    }
                }
            }
        }).$mount('#app');
    }

    toast(text) {
        this.vue.$message.warn(text);
    }

    notification(config) {
        cordova.plugins.notification.local.schedule(config);
        // cordova.plugins.notification.local.on(event, callback, scope);
    }
}