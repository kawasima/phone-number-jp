/**
 * The parser & validator of Japanese phone number
 *
 * @see https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/new_framework.html
 */

function isInternalJapan(telNo) {
  return telNo.startsWith('0');
}

function isValidLengthString(s, len) {
  return (typeof s === 'string' || s instanceof String) && s.length === len;
}

class PhoneNumber {
  constructor(areaCd, localNumber, subscriberNumber) {
    this.areaCd = areaCd;
    this.localNumber = localNumber;
    this.subscriberNumber = subscriberNumber;
  }

  toString() {
    return `${this.areaCd}-${this.localNumber}-${this.subscriberNumber}`;
  }
}

/**
 * Landline Phone Number 固定電話番号
 *
 * 0ABCDEFGHJ
 */
function landLinePhoneNumberOption(ln, areaData) {
  const localNumber = Object.keys(areaData || {})
        .sort((a,b) => b.length - a.length)
        .find(n => ln.startsWith(n));
  return localNumber ? areaData[localNumber] : {};
}

class LandLinePhoneNumber extends PhoneNumber {
  constructor(areaCd, localNumber, subscriberNumber, options = {}) {
    super(areaCd, localNumber, subscriberNumber);
    this.MA = options.MA;
    this.carrier = options.carrier;
    this.status = options.status;
  }

  static isApplicable(s) {
    return isValidLengthString(s, 10) && Object.keys(LandLinePhoneNumber.NUMBERS)
      .sort((a,b) => b.length - a.length)
      .find(n => s.startsWith(n));
  }

  static parse(s) {
    const areaCd = Object.keys(LandLinePhoneNumber.NUMBERS)
          .sort((a,b) => b.length - a.length)
          .find(n => s.startsWith(n));
    if (areaCd) {
      const localNumber = s.substring(areaCd.length, s.length - 4);
      return new LandLinePhoneNumber(
        areaCd,
        localNumber,
        s.substring(s.length - 4),
        landLinePhoneNumberOption(localNumber, LandLinePhoneNumber.NUMBERS[areaCd])
      );
    } else {
      throw Error(`${s} is not an Landline number`)
    }
  }
}
LandLinePhoneNumber.NUMBERS = require('./phoneNumbers');

/**
 * Service phone number 付加的役務電話番号
 */
class ServicePhoneNumber extends PhoneNumber {
  static isApplicable(s) {
    if (typeof s !== 'string' && !(s instanceof String)) return false;
    const prefix = ServicePhoneNumber.NUMBERS.find(n => s.startsWith(n.prefix));
    return prefix && s.length === prefix.length;
  }

  static parse(s) {
    const entry = ServicePhoneNumber.NUMBERS.find(n => s.startsWith(n.prefix) && s.length === n.length);
    if (entry) {
      return new ServicePhoneNumber(
        entry.prefix,
        s.substring(entry.prefix.length, s.length - entry.subscriberLength),
        s.substring(s.length - entry.subscriberLength)
      );
    }
    throw Error(`${s} is not a service phone number`);
  }
}
ServicePhoneNumber.NUMBERS = [
  { prefix: '0120', length: 10, subscriberLength: 3 },
  { prefix: '0170', length: 10, subscriberLength: 3 },
  { prefix: '0180', length: 10, subscriberLength: 3 },
  { prefix: '0570', length: 10, subscriberLength: 3 },
  { prefix: '0800', length: 11, subscriberLength: 4 },
  { prefix: '0990', length: 10, subscriberLength: 3 },
];

/**
 * M2M データ伝送携帯電話番号
 */
class M2MNumber extends PhoneNumber {
  static isApplicable(s) {
    return M2MNumber.PATTERN_14.exec(s) || M2MNumber.PATTERN_11.exec(s);
  }

  static parse(s) {
    const m14 = M2MNumber.PATTERN_14.exec(s);
    if (m14) {
      return new M2MNumber(
        '0200',
        s.substring(4, 9),
        s.substring(9)
      );
    }
    const m11 = M2MNumber.PATTERN_11.exec(s);
    if (m11) {
      return new M2MNumber(
        '020',
        s.substring(3, 7),
        s.substring(7)
      );
    }
    throw Error(`${s} is not an M2M number`);
  }
}
M2MNumber.PATTERN_14 = /^(0200)(\d{5})(\d{5})$/;
M2MNumber.PATTERN_11 = /^(020)([1-35-9]\d{3})(\d{4})$/;

/**
 * Mobile phone number 音声伝送携帯電話
 */
class MobilePhoneNumber extends PhoneNumber {
  static isApplicable(s) {
    return MobilePhoneNumber.PATTERN.exec(s);
  }

  static parse(s) {
    const m = MobilePhoneNumber.PATTERN.exec(s);
    if (m) {
      return new MobilePhoneNumber(m[1], m[2], m[3]);
    } else {

    }
  }
}
MobilePhoneNumber.PATTERN = /^(060|070|080|090)([1-9]\d{3})(\d{4})$/;

/**
 * Pocket bell number 無線呼出番号
 */
class PocketBellNumber extends PhoneNumber {
  static isApplicable(s) {
    return s.startsWith('0204');
  }

  static parse(s) {
    return new PocketBellNumber(
      '020',
      s.substring(3, 7),
      s.substring(7)
    );
  }
}

/**
 * IP Phone Number 特定IP電話番号
 */
class IPPhoneNumber extends PhoneNumber {
  static isApplicable(s) {
    return IPPhoneNumber.PATTERN.exec(s);
  }
  static parse(s) {
    const m = IPPhoneNumber.PATTERN.exec(s);
    if (m) {
      return new IPPhoneNumber('050', m[1], m[2]);
    } else {
      throw Error(`${s} is not an IP phone number`);
    }
  }
}
IPPhoneNumber.PATTERN = /^050([1-9]\d{3})(\d{4})$/;

/**
 * FMC Phone Number FMC電話番号
 */
class FMCPhoneNumber extends PhoneNumber {
  static isApplicable(s) {
    return FMCPhoneNumber.PATTERN.exec(s);
  }
  static parse(s) {
    const m = FMCPhoneNumber.PATTERN.exec(s);
    if (m) {
      return new FMCPhoneNumber('060', m[1], m[2]);
    } else {
      throw Error(`${s} is not an FMC phone number`);
    }
  }
}
FMCPhoneNumber.PATTERN = /^060(0\d{3})(\d{4})$/;


/**
 *  Not supported 特定接続電話番号 (091CDE...)
 */

/**
 * IMSI Phone Number IMSI
 */
class IMSI extends PhoneNumber {
  static isApplicable(s) {
    return isValidLengthString(s, 15) && s.startsWith('44');
  }

  static parse(s) {
    return new IMSI(
      s.substring(0, 2),
      s.substring(2, 11),
      s.substring(11)
    );
  }
}

const DEFAULT_AVAILABLE_TYPES = [
  LandLinePhoneNumber,
  MobilePhoneNumber,
  IPPhoneNumber
];

function parse(s, options = {}) {
  const phoneNumbers = (options.types || DEFAULT_AVAILABLE_TYPES)
        .map(t => typeof t === 'string' ? module.exports[t] : t)
        .filter(t => t.isApplicable(s))
        .map(t => t.parse(s));
  return phoneNumbers.length > 0 ? phoneNumbers[0] : null;
}

module.exports = {
  parse,

  LandLinePhoneNumber,
  MobilePhoneNumber,
  IPPhoneNumber,
  ServicePhoneNumber,
  M2MNumber,
  PocketBellNumber,
  FMCPhoneNumber,
  IMSI
}
