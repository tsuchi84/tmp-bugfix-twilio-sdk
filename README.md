# tmp-bugfix-twilio-sdk

## なにこれ

TwilioのSDKで、connect→disonnectを繰り返すと音が出なくなる現象の実証用コードです。

## つかいかた

### インストール

#### node_modulesのインストール

```bash
yarn
```

or 

```bash
npm install
```

#### 他に必要なもの

* [ngrok](https://ngrok.com/)

### Twilioの設定

#### TwiML Appの作成

* 作成して、Voice、URLは後ほど起動するngrokのホストで、POSTに設定する
    * `https://<id>.ngrok.io/outbound`

#### その他必要な項目

* ACCOUNT SID
* AUTH TOKEN
* TwiML App SID
* 架電元になる電話番号

### ビルド

#### .envを設定

* `.env.example`を元に`.env`を作成
* 必須
    * TWILIO_ACCOUNT_SID
    * TWILIO_AUTH_TOKEN
    * TWILIO_APP_SID
    * TWILIO_PHONE_NUMBER （+81で始まるTwilioの電話番号）
* 任意
    * TWILIO_CLIENT_USER （多分無くても動く）
    * DEFAULT_CALL_NUMBER （入れるとテキストボックスにデフォルトで入る）

#### webpackでビルド

```
yarn run build
```

### サーバー起動

```
yarn run server
```

# 現象の再現方法

1. Chromeで `https://<id>.ngrok.io/outbound` を開く
    1. `chrome://media-internals/` も開いておくと良い
1. `devices` を 規定以外のものに変更する
1. 適当な番号に架電する（一定のSayを返す番号にかけると便利）
1. 相手の応答が聞こえたらdisconnectを押す
1. 3.から繰り返す

## 現象

* だいたい25回くらい架電したあたりで、発信音が聞こえなくなる
* `chrome://media-internals/`を見ると、1回の架電で(PLAY)状態のプレイヤーが3つずつ増えていく
* 30回前後で通話の音も聞こえなくなる

## 考察

* 規定のデバイスのままだと `chrome://media-internals/` のデバイスの増加が1個ずつになり、40回程度かけても現象は発生しない
* デバイスを切り替えると増え方が大きくなり現象は再現する
* よって `setSinkID()` 周りでIDを明示的に設定した場合にのみ発生するものと思われる

## [WIP]対応方法

```patch
Index: src/js/library/twilio.1.4.35.js
===================================================================
@@ -5606,6 +5606,9 @@
                                     }
                                     _this2.dispatchEvent('ended');
                                 });
+                                this.addEventListener('ended', function () {
+                                    _this2._audioElement.srcObject = null;
+                                });
                                 _context.next = 11;
                                 return this._bufferPromise;
```
