jest.mock('./phoneNumbers', () => ({}), { virtual: true });

const {
  parse,
  MobilePhoneNumber,
  IPPhoneNumber,
  FMCPhoneNumber,
  ServicePhoneNumber,
  M2MNumber,
  PocketBellNumber,
  IMSI
} = require('./index');

describe('MobilePhoneNumber', () => {
  test.each([
    ['09012345678', '090', '1234', '5678'],
    ['08012345678', '080', '1234', '5678'],
    ['07012345678', '070', '1234', '5678'],
  ])('parse %s (従来の携帯番号)', (input, areaCd, local, subscriber) => {
    const result = MobilePhoneNumber.parse(input);
    expect(result).toBeInstanceOf(MobilePhoneNumber);
    expect(result.areaCd).toBe(areaCd);
    expect(result.localNumber).toBe(local);
    expect(result.subscriberNumber).toBe(subscriber);
  });

  test.each([
    ['06012345678', '060', '1234', '5678'],
    ['06091234567', '060', '9123', '4567'],
  ])('parse %s (060携帯番号)', (input, areaCd, local, subscriber) => {
    const result = MobilePhoneNumber.parse(input);
    expect(result).toBeInstanceOf(MobilePhoneNumber);
    expect(result.areaCd).toBe(areaCd);
    expect(result.localNumber).toBe(local);
    expect(result.subscriberNumber).toBe(subscriber);
  });

  test('060携帯番号のtoString', () => {
    const result = MobilePhoneNumber.parse('06012345678');
    expect(result.toString()).toBe('060-1234-5678');
  });

  test('isApplicable は060携帯番号を認識する', () => {
    expect(MobilePhoneNumber.isApplicable('06012345678')).toBeTruthy();
    expect(MobilePhoneNumber.isApplicable('06091234567')).toBeTruthy();
  });

  test('isApplicable は060-0XXX(FMC番号)をモバイルと判定しない', () => {
    expect(MobilePhoneNumber.isApplicable('06001234567')).toBeFalsy();
  });

  test('isApplicable は不正な番号を拒否する', () => {
    expect(MobilePhoneNumber.isApplicable('06012345')).toBeFalsy();
    expect(MobilePhoneNumber.isApplicable('060123456789')).toBeFalsy();
    expect(MobilePhoneNumber.isApplicable('09001234567')).toBeFalsy();
  });
});

describe('FMCPhoneNumber', () => {
  test('parse 060-0XXX-XXXX', () => {
    const result = FMCPhoneNumber.parse('06001234567');
    expect(result).toBeInstanceOf(FMCPhoneNumber);
    expect(result.areaCd).toBe('060');
    expect(result.localNumber).toBe('0123');
    expect(result.subscriberNumber).toBe('4567');
  });

  test('isApplicable はFMC番号を認識する', () => {
    expect(FMCPhoneNumber.isApplicable('06001234567')).toBeTruthy();
  });

  test('isApplicable は060-1XXX以降(携帯番号)をFMCと判定しない', () => {
    expect(FMCPhoneNumber.isApplicable('06012345678')).toBeFalsy();
  });

  test('不正な番号でエラーをスローする', () => {
    expect(() => FMCPhoneNumber.parse('06012345678')).toThrow();
  });
});

describe('ServicePhoneNumber', () => {
  test.each([
    ['0120123456', '0120', '123', '456'],
    ['0570123456', '0570', '123', '456'],
    ['0180123456', '0180', '123', '456'],
    ['0990123456', '0990', '123', '456'],
    ['0170123456', '0170', '123', '456'],
  ])('parse %s (10桁)', (input, areaCd, local, subscriber) => {
    const result = ServicePhoneNumber.parse(input);
    expect(result).toBeInstanceOf(ServicePhoneNumber);
    expect(result.areaCd).toBe(areaCd);
    expect(result.localNumber).toBe(local);
    expect(result.subscriberNumber).toBe(subscriber);
  });

  test('parse 0800番号 (11桁)', () => {
    const result = ServicePhoneNumber.parse('08001234567');
    expect(result).toBeInstanceOf(ServicePhoneNumber);
    expect(result.areaCd).toBe('0800');
    expect(result.localNumber).toBe('123');
    expect(result.subscriberNumber).toBe('4567');
  });

  test('toString', () => {
    expect(ServicePhoneNumber.parse('0120123456').toString()).toBe('0120-123-456');
    expect(ServicePhoneNumber.parse('08001234567').toString()).toBe('0800-123-4567');
  });

  test('isApplicable は各番号を認識する', () => {
    expect(ServicePhoneNumber.isApplicable('0120123456')).toBeTruthy();
    expect(ServicePhoneNumber.isApplicable('08001234567')).toBeTruthy();
    expect(ServicePhoneNumber.isApplicable('0570123456')).toBeTruthy();
  });

  test('isApplicable は桁数が不正な番号を拒否する', () => {
    expect(ServicePhoneNumber.isApplicable('012012345')).toBeFalsy();
    expect(ServicePhoneNumber.isApplicable('01201234567')).toBeFalsy();
    expect(ServicePhoneNumber.isApplicable('0800123456')).toBeFalsy();
  });

  test('isApplicable は文字列以外を拒否する', () => {
    expect(ServicePhoneNumber.isApplicable(120123456)).toBeFalsy();
    expect(ServicePhoneNumber.isApplicable(null)).toBeFalsy();
  });

  test('不正な番号でエラーをスローする', () => {
    expect(() => ServicePhoneNumber.parse('09012345678')).toThrow();
  });

  test('typesオプションでパースできる', () => {
    const result = parse('0120123456', { types: [ServicePhoneNumber] });
    expect(result).toBeInstanceOf(ServicePhoneNumber);
  });
});

describe('M2MNumber', () => {
  describe('11桁 (020-XXXX-XXXX)', () => {
    test.each([
      ['02012345678', '020', '1234', '5678'],
      ['02098765432', '020', '9876', '5432'],
    ])('parse %s', (input, areaCd, local, subscriber) => {
      const result = M2MNumber.parse(input);
      expect(result).toBeInstanceOf(M2MNumber);
      expect(result.areaCd).toBe(areaCd);
      expect(result.localNumber).toBe(local);
      expect(result.subscriberNumber).toBe(subscriber);
    });

    test('isApplicable は11桁M2M番号を認識する', () => {
      expect(M2MNumber.isApplicable('02012345678')).toBeTruthy();
      expect(M2MNumber.isApplicable('02098765432')).toBeTruthy();
    });

    test('0204(ポケットベル)はM2Mと判定しない', () => {
      expect(M2MNumber.isApplicable('02041234567')).toBeFalsy();
    });

    test('0200で始まる11桁はM2Mと判定しない', () => {
      expect(M2MNumber.isApplicable('02001234567')).toBeFalsy();
    });
  });

  describe('14桁 (0200-XXXXX-XXXXX)', () => {
    test('parse 14桁番号', () => {
      const result = M2MNumber.parse('02001234567890');
      expect(result).toBeInstanceOf(M2MNumber);
      expect(result.areaCd).toBe('0200');
      expect(result.localNumber).toBe('12345');
      expect(result.subscriberNumber).toBe('67890');
    });

    test('isApplicable は14桁M2M番号を認識する', () => {
      expect(M2MNumber.isApplicable('02001234567890')).toBeTruthy();
      expect(M2MNumber.isApplicable('02009876543210')).toBeTruthy();
    });

    test('14桁番号のtoString', () => {
      const result = M2MNumber.parse('02001234567890');
      expect(result.toString()).toBe('0200-12345-67890');
    });

    test('不正な桁数を拒否する', () => {
      expect(M2MNumber.isApplicable('0200123456789')).toBeFalsy();
      expect(M2MNumber.isApplicable('020012345678901')).toBeFalsy();
    });
  });

  test('不正な番号でエラーをスローする', () => {
    expect(() => M2MNumber.parse('03012345678')).toThrow();
  });
});

describe('IPPhoneNumber', () => {
  test('parse 050番号', () => {
    const result = IPPhoneNumber.parse('05012345678');
    expect(result).toBeInstanceOf(IPPhoneNumber);
    expect(result.areaCd).toBe('050');
    expect(result.localNumber).toBe('1234');
    expect(result.subscriberNumber).toBe('5678');
  });

  test('isApplicable', () => {
    expect(IPPhoneNumber.isApplicable('05012345678')).toBeTruthy();
    expect(IPPhoneNumber.isApplicable('05001234567')).toBeFalsy();
  });
});

describe('PocketBellNumber', () => {
  test('parse 0204番号', () => {
    const result = PocketBellNumber.parse('02041234567');
    expect(result).toBeInstanceOf(PocketBellNumber);
    expect(result.areaCd).toBe('020');
    expect(result.localNumber).toBe('4123');
    expect(result.subscriberNumber).toBe('4567');
  });

  test('isApplicable', () => {
    expect(PocketBellNumber.isApplicable('02041234567')).toBeTruthy();
    expect(PocketBellNumber.isApplicable('02012345678')).toBeFalsy();
  });
});

describe('IMSI', () => {
  test('parse IMSI番号', () => {
    const result = IMSI.parse('440123456789012');
    expect(result).toBeInstanceOf(IMSI);
    expect(result.areaCd).toBe('44');
    expect(result.localNumber).toBe('012345678');
    expect(result.subscriberNumber).toBe('9012');
  });

  test('isApplicable', () => {
    expect(IMSI.isApplicable('440123456789012')).toBeTruthy();
    expect(IMSI.isApplicable('44012345678901')).toBeFalsy();
    expect(IMSI.isApplicable('330123456789012')).toBeFalsy();
  });
});

describe('parse (統合パーサー)', () => {
  test('携帯電話番号(090)をパースする', () => {
    const result = parse('09012345678');
    expect(result).toBeInstanceOf(MobilePhoneNumber);
  });

  test('携帯電話番号(060)をパースする', () => {
    const result = parse('06012345678');
    expect(result).toBeInstanceOf(MobilePhoneNumber);
  });

  test('IP電話番号をパースする', () => {
    const result = parse('05012345678');
    expect(result).toBeInstanceOf(IPPhoneNumber);
  });

  test('不明な番号はnullを返す', () => {
    const result = parse('99999999999');
    expect(result).toBeNull();
  });

  test('typesオプションでパース対象を指定できる', () => {
    const result = parse('02012345678', { types: [M2MNumber] });
    expect(result).toBeInstanceOf(M2MNumber);
  });

  test('typesオプションで文字列指定ができる', () => {
    const result = parse('06012345678', { types: ['MobilePhoneNumber'] });
    expect(result).toBeInstanceOf(MobilePhoneNumber);
  });

  test('typesオプションでM2M 14桁をパースできる', () => {
    const result = parse('02001234567890', { types: [M2MNumber] });
    expect(result).toBeInstanceOf(M2MNumber);
    expect(result.areaCd).toBe('0200');
  });

  test('typesオプションでFMC番号をパースできる', () => {
    const result = parse('06001234567', { types: [FMCPhoneNumber] });
    expect(result).toBeInstanceOf(FMCPhoneNumber);
  });

  test('ServicePhoneNumberはデフォルトではパースされない', () => {
    expect(parse('0120123456')).toBeNull();
    expect(parse('08001234567')).toBeNull();
  });
});
