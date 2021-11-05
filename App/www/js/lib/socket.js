class Socket {
    constructor() {
        this.connected = false;
        this.ip = '45.76.116.86';
    }

    url() {
        return 'http://' + this.ip + ':5000';
    }

    connect(component, next) {
        if (this.connected) {
            next();
        } else {
            this.con = io.connect(this.url(), {reconnection: false});
            this.con.on("connect", () => {
                this.set(true, component)
                this.interval = setInterval(() => {
                    $socket.con.emit('notify', (res) => {
                        if (res !== undefined) {
                            $app.notification({
                                title: 'MyGuard',
                                text: 'Someone moved your thing at ' + new Date(res.time * 1000),
                                foreground: true
                            });
                        }
                    });
                }, 1000);
                next();
            });
            this.con.on("disconnect", () => {
                if (this.connected === true) {
                    $app.vue.to('/container/home');
                }
                this.set(false, component);
                clearInterval(this.interval);
                $app.toast('Socket disconnected');
            });
        }
    }

    disconnect() {
        this.con.disconnect();
    }

    set(status, component) {
        $socket.connected = status
        component.connected = $socket.connected;
        component.disable = $socket.connected;
        component.reload();
    }
}