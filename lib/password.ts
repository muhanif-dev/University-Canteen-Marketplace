import bcrypt from "bcryptjs";

const DEFAULT_SALT_ROUNDS = 12;

export async function hashPassword(
  password: string,
  saltRounds: number = DEFAULT_SALT_ROUNDS
): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
