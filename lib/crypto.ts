import bcrypt from 'bcryptjs';

/**
 * Compare a plaintext code against a bcrypt hash.
 * Used at login time to verify the user's secret code.
 */
export async function compareCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/**
 * Hash a plaintext code with bcrypt (setup-time utility).
 * Run once locally to generate the hash for .env:
 *   node -e "console.log(require('bcryptjs').hashSync('YOUR_CODE_HERE', 10))"
 */
export function hashCode(code: string): string {
  return bcrypt.hashSync(code, 10);
}
