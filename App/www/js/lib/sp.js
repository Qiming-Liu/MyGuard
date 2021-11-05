class SP {
    constructor() {
        this.sharedPreferences = window.plugins.SharedPreferences.getInstance();
    }

    put(key, value) {
        this.sharedPreferences.put(key, value);
    }

    get(key, callback) {
        this.sharedPreferences.get(key, value => {
            callback(value);
        }, error => {
            console.log(error);
            callback(undefined);
        });
    }

    delete(key) {
        this.sharedPreferences.del(key);
    }
}