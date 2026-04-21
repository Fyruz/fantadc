const BCRYPT_MAX_BYTES = 72;

export function isWithinBcryptByteLimit(value: string): boolean {
  return new TextEncoder().encode(value).length <= BCRYPT_MAX_BYTES;
}
