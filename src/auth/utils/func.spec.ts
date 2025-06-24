import { generatePassword, extractOrderId } from './func';

describe('generatePassword', () => {
  it('returns a string of the requested length', () => {
    const length = 12;
    const password = generatePassword(length);
    expect(typeof password).toBe('string');
    expect(password).toHaveLength(length);
  });
});

describe('extractOrderId', () => {
  it('extracts the id from a valid order code', () => {
    const code = 'ORDER-98765_PAYPAL';
    expect(extractOrderId(code)).toBe('98765');
  });

  it('returns null for an invalid order code', () => {
    expect(extractOrderId('INVALIDCODE')).toBeNull();
  });
});
