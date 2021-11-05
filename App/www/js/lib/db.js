class DB {//indexDB is not actually used in this project
    constructor() {
        this.db = new Dexie('localdb');
        this.db.version(1).stores({
            kv: '&key, value'
        });
    }

    put(key, value) {
        this.db.kv.put({
            key: key,
            value: value
        });
    }

    get(key, callback) {
        this.db.kv.get(key).then(value => {
            callback(value);
        });
    }

    delete(key) {
        this.db.kv.where('key').equals(key).delete();
    }
}