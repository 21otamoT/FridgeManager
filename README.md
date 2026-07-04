## デバッグ

#### 実機をUSB接続する

```
npm run android
```

## ビルド

### テスト用

.env.productionのAppIdと広告Idをテスト用に変える
その後下記コマンドを実行

```
npm run build_android_prod
```

### 本番用

.env.productionのAppIdと広告Idを本番用に変える
その後下記コマンドを実行

```
npm run build_android_prod
```

## prebuild

- prebuild後はlocal.propertiesを作成し下記を記述する

```
sdk.dir=/Users/hiroseyukihiro/Library/Android/sdk
```
