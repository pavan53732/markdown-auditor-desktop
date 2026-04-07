import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  buildWindowsSigningConfig,
  detectWindowsSigningMode
} = require('../../../scripts/windowsSigningSupport.cjs');

describe('Windows signing support', () => {
  it('detects an unsigned local environment by default', () => {
    const signing = detectWindowsSigningMode({});
    expect(signing.configured).toBe(false);
    expect(signing.mode).toBe('unsigned');
  });

  it('builds a local-certificate signing config when certificate env vars are present', () => {
    const env = {
      WINDOWS_SIGN_PUBLISHER_NAME: 'Example Publisher',
      WINDOWS_SIGN_CERTIFICATE_FILE: 'build/test-cert.pfx',
      WINDOWS_SIGN_CERTIFICATE_PASSWORD: 'secret',
      WINDOWS_SIGN_FORCE: '1'
    };

    const signing = detectWindowsSigningMode(env);
    const config = buildWindowsSigningConfig(env);

    expect(signing.configured).toBe(true);
    expect(signing.mode).toBe('local_certificate');
    expect(config.signtoolOptions.publisherName).toBe('Example Publisher');
    expect(config.certificateFile).toMatch(/build[\\/]+test-cert\.pfx$/);
    expect(config.certificatePassword).toBe('secret');
    expect(config.signAndEditExecutable).toBe(true);
    expect(config.forceCodeSigning).toBe(true);
  });

  it('builds Azure Trusted Signing config when Azure env vars are present', () => {
    const env = {
      WINDOWS_SIGN_PUBLISHER_NAME: 'Example Publisher',
      WINDOWS_AZURE_TRUSTED_SIGNING_ENDPOINT: 'https://example.codesigning.azure.net',
      WINDOWS_AZURE_TRUSTED_SIGNING_ACCOUNT_NAME: 'example-account',
      WINDOWS_AZURE_TRUSTED_SIGNING_PROFILE_NAME: 'example-profile'
    };

    const signing = detectWindowsSigningMode(env);
    const config = buildWindowsSigningConfig(env);

    expect(signing.configured).toBe(true);
    expect(signing.mode).toBe('azure_trusted_signing');
    expect(config.signtoolOptions.publisherName).toBe('Example Publisher');
    expect(config.azureSignOptions).toEqual({
      publisherName: 'Example Publisher',
      endpoint: 'https://example.codesigning.azure.net',
      codeSigningAccountName: 'example-account',
      certificateProfileName: 'example-profile'
    });
  });
});
