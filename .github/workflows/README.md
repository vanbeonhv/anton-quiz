# GitHub Actions Deployment Setup

This workflow automatically deploys the application to your VPS whenever code is pushed to the `main` branch.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. VPS_SSH_KEY
Your private SSH key for accessing the VPS.

**To get this:**
```bash
cat ~/.ssh/id_rsa_vps_1
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

### 2. ANSIBLE_VAULT_PASSWORD
The password used to encrypt your `deployment/vars/secrets.yml` file.

This is the password you enter when running:
```bash
ansible-vault view deployment/vars/secrets.yml
```

## How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `VPS_SSH_KEY`, Value: (paste your SSH private key)
   - Name: `ANSIBLE_VAULT_PASSWORD`, Value: (paste your vault password)