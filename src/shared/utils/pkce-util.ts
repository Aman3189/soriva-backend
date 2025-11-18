import crypto from 'crypto';

/**
 * ==========================================
 * PKCE UTILITY CLASS
 * ==========================================
 * Implements PKCE (Proof Key for Code Exchange) for OAuth 2.0
 * RFC 7636 compliant implementation
 * Last Updated: November 18, 2025
 */

export class PKCEUtil {
  /**
   * Generate random code verifier (43-128 characters)
   * Uses cryptographically secure random bytes
   */
  public generateCodeVerifier(): string {
    const randomBytes = crypto.randomBytes(32);
    return this.base64URLEncode(randomBytes);
  }

  /**
   * Generate code challenge from verifier
   * Uses SHA-256 hash as per RFC 7636
   */
  public generateCodeChallenge(verifier: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(verifier)
      .digest();
    return this.base64URLEncode(hash);
  }

  /**
   * Verify code verifier against challenge
   * Used for validation during callback
   */
  public verifyCodeChallenge(verifier: string, challenge: string): boolean {
    const computedChallenge = this.generateCodeChallenge(verifier);
    return computedChallenge === challenge;
  }

  /**
   * Generate state parameter for CSRF protection
   * 16 bytes = 128 bits of randomness
   */
  public generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Base64URL encoding (URL-safe base64)
   * Converts standard base64 to URL-safe format
   * - Replace + with -
   * - Replace / with _
   * - Remove = padding
   */
  private base64URLEncode(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate nonce for additional security
   * Optional: for OpenID Connect
   */
  public generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}

// Export singleton instance
export default new PKCEUtil();