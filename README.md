phone-number-jp
========

The parser and validator of Japanese phone number.

## Specifications

### Parse

```js
const { parse } = require('phone-number-jp');

parse('09099999999');
/*
MobilePhoneNumber {
  areaCd: '090',
  localNumber: '9999',
  subscriberNumber: '9999'
}
*/

parse('0725999999')
/*
LandLinePhoneNumber {
  areaCd: '0725',
  localNumber: '99',
  subscriberNumber: '9999',
  MA: '和泉',
  carrier: 'ＮＴＴ西日本',
  status: '使用中'
}
```
You can give the valid number types.

```js
parse('02049999999', {types: ['LandLinePhoneNumber', 'MobilePhoneNumber', 'IPPhoneNumber', 'ServicePhoneNumber']});
/*
PocketBellNumber {
  areaCd: '020',
  localNumber: '4999',
  subscriberNumber: '9999'
}
*/

```
