import { createHmac } from 'crypto';
import * as OAuth from 'oauth-1.0a';

export default class Twitter {
    constructor (opts) {
        this.consumerKey = opts.consumerKey;
        this.consumerSecret = opts.consumerSecret;
        this.accessTokenKey = opts.accessTokenKey;
        this.accessTokenSecret = opts.accessTokenSecret;
        this.proxyURL = opts.proxyURL;

        this.oauth = OAuth({
            consumer: {
                key: this.consumerKey,
                secret: this.consumerSecret
            },
            signature_method: 'HMAC-SHA1',
            hash_function: function(base_string, key) {
                return createHmac('sha1', key).update(base_string).digest('base64');
            }
        });
    }

    get baseURL() {
        return this.proxyURL || 'https://api.twitter.com';
    }

    search(options = {}) {
        const params = this.objToParam(options);
        const request_data = {
            url: `https://api.twitter.com/1.1/search/tweets.json?${params}&tweet_mode=extended`,
            method: 'GET'
        };

        return this.apifetch(request_data);
    }

    verify_credentials (options = {}) {
        var params = this.objToParam(options);
        if(params) params += '?';
        const request_data = {
            url: `https://api.twitter.com/1.1/account/verify_credentials.json${params}`,
            method: 'GET'
        };

        return this.apifetch(request_data);
    }

    apifetch(request_data) {
        const url = request_data.url.replace('https://api.twitter.com', this.baseURL);

        const token = {
            key: this.accessTokenKey,
            secret: this.accessTokenSecret
        };

        return fetch(url, {
            'headers': this.oauth.toHeader(this.oauth.authorize(request_data, token))
        });
    }

    objToParam(obj) {
        return Object.keys(obj)
                        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
                        .join('&');
    }
}
