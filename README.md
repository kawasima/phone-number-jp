# phone-number-jp

The parser and validator of Japanese phone number.

## Setup

```bash
npm install
```

### phoneNumbers.json の生成

固定電話番号（`LandLinePhoneNumber`）のパースには、総務省の番号指定データから生成する `phoneNumbers.json` が必要です。

```bash
node dev/importer.js
```

このスクリプトは[総務省 電気通信番号指定状況](https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/number_shitei.html)から市外局番ごとのExcelファイルをダウンロードし、`phoneNumbers.json` を生成します。

データを最新の状態に保つには、定期的にこのスクリプトを再実行してください。

## Usage

### parse

```js
const { parse } = require('phone-number-jp');

parse('09099999999');
// MobilePhoneNumber { areaCd: '090', localNumber: '9999', subscriberNumber: '9999' }

parse('06012345678');
// MobilePhoneNumber { areaCd: '060', localNumber: '1234', subscriberNumber: '5678' }

parse('05012345678');
// IPPhoneNumber { areaCd: '050', localNumber: '1234', subscriberNumber: '5678' }

parse('0725999999');
// LandLinePhoneNumber { areaCd: '0725', localNumber: '99', subscriberNumber: '9999', MA: '和泉', carrier: 'ＮＴＴ西日本', status: '使用中' }
```

デフォルトでは `LandLinePhoneNumber`、`MobilePhoneNumber`、`IPPhoneNumber` をパース対象とします。

### types オプション

`types` オプションでパース対象の型を指定できます。クラスオブジェクトまたは文字列で指定します。

```js
const { parse, ServicePhoneNumber, M2MNumber } = require('phone-number-jp');

parse('0120123456', { types: [ServicePhoneNumber] });
// ServicePhoneNumber { areaCd: '0120', localNumber: '123', subscriberNumber: '456' }

parse('02001234567890', { types: [M2MNumber] });
// M2MNumber { areaCd: '0200', localNumber: '12345', subscriberNumber: '67890' }

parse('06001234567', { types: ['FMCPhoneNumber'] });
// FMCPhoneNumber { areaCd: '060', localNumber: '0123', subscriberNumber: '4567' }
```

### 各クラスの直接利用

```js
const { MobilePhoneNumber } = require('phone-number-jp');

MobilePhoneNumber.isApplicable('09012345678'); // true
MobilePhoneNumber.parse('09012345678').toString(); // '090-1234-5678'
```

## Supported Number Types

- `LandLinePhoneNumber` - 固定電話番号 (0AB-J, 10桁)
- `MobilePhoneNumber` - 携帯電話番号 (060/070/080/090, 11桁)
- `IPPhoneNumber` - IP電話番号 (050, 11桁)
- `FMCPhoneNumber` - FMC電話番号 (060-0XXX, 11桁)
- `ServicePhoneNumber` - 付加的役務電話番号 (0120/0170/0180/0570/0800/0990, 10桁 or 11桁)
- `M2MNumber` - M2M番号 (020: 11桁, 0200: 14桁)
- `PocketBellNumber` - 無線呼出番号 (0204, 11桁)
- `IMSI` - IMSI (44, 15桁)

## REPL

対話的に電話番号のパースを試すことができます。

```bash
npm run repl
```

REPL内では以下のコマンドが利用できます:

- `.types` - 利用可能なPhoneNumber型の一覧を表示
- `.usage` - 使い方を表示
- `.help` - 全コマンド一覧を表示

## Test

```bash
npm test
```

## Reference

- [総務省 電気通信番号制度](https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/index.html)
- [総務省 電気通信番号指定状況](https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/number_shitei.html)
- [携帯電話番号への060番号の追加](https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/060keitai.html)
- [M2M等専用番号の創設](https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/m2m.html)

## License

MIT
