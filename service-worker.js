// var dataCacheName = 'zhongqihuo-data-v1';
var cacheName = 'zhongqihuo-assets-v1';

var filesToCache = [
    '/',
    '/index.html',
    // '/scripts/app.js',
    // '/styles/inline.css',
    // '/images/clear.png',
    // '/images/cloudy-scattered-showers.png',
    // '/images/cloudy.png',
    // '/images/fog.png',
    // '/images/ic_add_white_24px.svg',
    // '/images/ic_refresh_white_24px.svg',
    // '/images/partly-cloudy.png',
    // '/images/rain.png',
    // '/images/scattered-showers.png',
    // '/images/sleet.png',
    // '/images/snow.png',
    // '/images/thunderstorm.png',
    // '/images/wind.png'
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Activate');
    // e.waitUntil(
    //     caches.keys().then(function (keyList) {
    //         return Promise.all(keyList.map(function (key) {
    //             if (key !== cacheName && key !== dataCacheName) {
    //                 console.log('[Service Worker] Removing old cache', key);
    //                 return caches.delete(key);
    //             }
    //         }));
    //     })
    // );

    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    // return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    // console.log('[Service Worker] Fetch', e.request.url);
    // var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    // if (e.request.url.indexOf(dataUrl) > -1) {
    //     /*
    //      * When the request URL contains dataUrl, the app is asking for fresh
    //      * weather data. In this case, the service worker always goes to the
    //      * network and then caches the response. This is called the "Cache then
    //      * network" strategy:
    //      * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
    //      */
    //     e.respondWith(
    //         caches.open(dataCacheName).then(function (cache) {
    //             return fetch(e.request).then(function (response) {
    //                 cache.put(e.request.url, response.clone());
    //                 return response;
    //             });
    //         })
    //     );
    // } else {
    //     /*
    //      * The app is asking for app shell files. In this scenario the app uses the
    //      * "Cache, falling back to the network" offline strategy:
    //      * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
    //      */
    //     e.respondWith(
    //         caches.match(e.request).then(function (response) {
    //             return response || fetch(e.request);
    //         })
    //     );
    // }
});
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Received a push message', event);

    var title = 'Yay a message.';
    var body = 'We have received a push message.';
    var icon = '/img/logo.png';
    var tag = 'simple-push-demo-notification-tag';

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon,
            tag: tag
        })
    );
});
