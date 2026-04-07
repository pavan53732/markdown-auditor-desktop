const { detectWindowsSigningMode } = require('./windowsSigningSupport.cjs');

const requireSigning = process.argv.includes('--require');
const signing = detectWindowsSigningMode(process.env);

if (signing.mode === 'local_certificate') {
  console.log(`Windows signing configured via local certificate (${signing.certificateFile || signing.certificateSha1}).`);
  process.exit(0);
}

if (signing.mode === 'azure_trusted_signing') {
  console.log(`Windows signing configured via Azure Trusted Signing (${signing.azureCodeSigningAccountName}/${signing.azureCertificateProfileName}).`);
  process.exit(0);
}

if (signing.mode === 'csc_env') {
  console.log('Windows signing configured via CSC_LINK / WIN_CSC_LINK environment variables.');
  process.exit(0);
}

const message = [
  'Windows signing is not configured.',
  'Supported options:',
  '- WINDOWS_SIGN_CERTIFICATE_FILE + WINDOWS_SIGN_CERTIFICATE_PASSWORD',
  '- WINDOWS_SIGN_CERTIFICATE_SHA1 (certificate store lookup)',
  '- WIN_CSC_LINK / CSC_LINK + matching key-password envs',
  '- WINDOWS_AZURE_TRUSTED_SIGNING_ENDPOINT + WINDOWS_AZURE_TRUSTED_SIGNING_ACCOUNT_NAME + WINDOWS_AZURE_TRUSTED_SIGNING_PROFILE_NAME'
].join('\n');

if (requireSigning) {
  console.error(message);
  process.exit(1);
}

console.log(message);
