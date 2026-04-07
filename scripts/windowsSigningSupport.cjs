const path = require('node:path');

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function firstValue(...values) {
  return values.find(hasValue) || '';
}

function normalizePathLike(value) {
  if (!hasValue(value)) return '';
  return path.resolve(value.trim());
}

function detectWindowsSigningMode(env = process.env) {
  const publisherName = firstValue(env.WINDOWS_SIGN_PUBLISHER_NAME, 'Prem V');
  const dedicatedCertificateFile = normalizePathLike(env.WINDOWS_SIGN_CERTIFICATE_FILE);
  const dedicatedCertificateSha1 = firstValue(env.WINDOWS_SIGN_CERTIFICATE_SHA1);
  const dedicatedCertificatePassword = firstValue(env.WINDOWS_SIGN_CERTIFICATE_PASSWORD);
  const cscLink = firstValue(env.WIN_CSC_LINK, env.CSC_LINK);
  const cscKeyPassword = firstValue(env.WIN_CSC_KEY_PASSWORD, env.CSC_KEY_PASSWORD);
  const azureEndpoint = firstValue(env.WINDOWS_AZURE_TRUSTED_SIGNING_ENDPOINT);
  const azureCodeSigningAccountName = firstValue(env.WINDOWS_AZURE_TRUSTED_SIGNING_ACCOUNT_NAME);
  const azureCertificateProfileName = firstValue(env.WINDOWS_AZURE_TRUSTED_SIGNING_PROFILE_NAME);

  const hasDedicatedCertificate = Boolean(dedicatedCertificateFile || dedicatedCertificateSha1);
  const hasAzureTrustedSigning = Boolean(
    azureEndpoint
    && azureCodeSigningAccountName
    && azureCertificateProfileName
  );
  const hasCscSigning = Boolean(cscLink);

  let mode = 'unsigned';
  if (hasDedicatedCertificate) {
    mode = 'local_certificate';
  } else if (hasAzureTrustedSigning) {
    mode = 'azure_trusted_signing';
  } else if (hasCscSigning) {
    mode = 'csc_env';
  }

  return {
    configured: mode !== 'unsigned',
    mode,
    publisherName,
    certificateFile: dedicatedCertificateFile,
    certificatePassword: dedicatedCertificatePassword,
    certificateSha1: dedicatedCertificateSha1,
    cscLink,
    cscKeyPassword,
    azureEndpoint,
    azureCodeSigningAccountName,
    azureCertificateProfileName,
    forceCodeSigning: String(env.WINDOWS_SIGN_FORCE || '').trim() === '1'
  };
}

function buildWindowsSigningConfig(env = process.env, { defaultPublisherName = 'Prem V' } = {}) {
  const signing = detectWindowsSigningMode({
    ...env,
    WINDOWS_SIGN_PUBLISHER_NAME: firstValue(env.WINDOWS_SIGN_PUBLISHER_NAME, defaultPublisherName)
  });

  const config = {
    signtoolOptions: {
      publisherName: signing.publisherName
    },
    signAndEditExecutable: true
  };

  if (signing.forceCodeSigning) {
    config.forceCodeSigning = true;
  }

  if (signing.mode === 'local_certificate') {
    if (signing.certificateFile) {
      config.certificateFile = signing.certificateFile;
    }
    if (signing.certificatePassword) {
      config.certificatePassword = signing.certificatePassword;
    }
    if (signing.certificateSha1) {
      config.certificateSha1 = signing.certificateSha1;
    }
  }

  if (signing.mode === 'azure_trusted_signing') {
    config.azureSignOptions = {
      publisherName: signing.publisherName,
      endpoint: signing.azureEndpoint,
      codeSigningAccountName: signing.azureCodeSigningAccountName,
      certificateProfileName: signing.azureCertificateProfileName
    };
  }

  return config;
}

module.exports = {
  buildWindowsSigningConfig,
  detectWindowsSigningMode
};
