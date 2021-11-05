class Firebase {
    constructor() {
        this.div = document.getElementById('firebase');
        firebase.initializeApp({
            apiKey: "AIzaSyD9ZjKKDDvSKGPx4ydsfxqXnWrrjqOxy3k",
            authDomain: "myguard-9a9cb.firebaseapp.com",
            projectId: "myguard-9a9cb",
            storageBucket: "myguard-9a9cb.appspot.com",
            messagingSenderId: "341801117972",
            appId: "1:341801117972:web:cb44a8be8759390558ba01",
            measurementId: "G-YRSCE4T961",
            databaseURL: "https://myguard-9a9cb-default-rtdb.asia-southeast1.firebasedatabase.app",
        });
    }

    loginInit(callback) {
        this.ui = new firebaseui.auth.AuthUI(firebase.auth());
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        console.log()
        this.ui.start('#firebase', {
            callbacks: {
                signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                    callback(authResult, redirectUrl);
                    return false;
                },
            },
            signInOptions: [
                {
                    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    requireDisplayName: false
                }
            ]
        });
    }

    getUser() {
        return firebase.auth().currentUser;
    }

    getData(query, callback) {
        firebase.database().ref(query).get().then((snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            } else {
                callback(undefined);
            }
        })
    }

    setData(query, value) {
        firebase.database().ref(query).set(value);
    }

    hasLink(uid, callback) {
        this.getData('device', all_device => {
            if (all_device === undefined) {
                callback(false);
            } else {
                let found = false;
                all_device = Object.values(all_device);
                for (let i = 0; i < all_device.length; i++) {
                    if (all_device[i].userid === uid) {
                        found = true;
                        callback(true);
                        break;
                    }
                }
                if (!found) {
                    callback(false);
                }
            }
        })
    }

    removeLink(uid, callback) {
        this.getData('device', all_device => {
            if (all_device === undefined) {
                callback();
            } else {
                let found = false;
                let keys = Object.keys(all_device)
                let values = Object.values(all_device);
                for (let i = 0; i < values.length; i++) {
                    if (values[i].userid === uid) {
                        firebase.database().ref('device/' + keys[i]).remove();
                        found = true;
                        callback();
                        break;
                    }
                }
                if (!found) {
                    callback();
                }
            }
        })
    }

    signOut(callback) {
        firebase.auth().signOut().then(() => {
            callback();
        });
    }
}