# Infrastructure Templates (VPS-Only)

This directory contains **template configurations** for VPS-only infrastructure that should never be committed to the local development environment.

## Directory Structure

```
ops/
├── nginx/                 # Nginx configuration templates
│   └── booksmartly.conf.template
├── systemd/              # Systemd service templates (if needed)
├── ssl/                  # SSL configuration templates
└── scripts/              # VPS deployment scripts
```

## Important Rules

1. **Never copy these files to your local development environment**
2. **These templates are synced to the VPS during deployment via rsync**
3. **All files here are templates - actual configs live only on the VPS**
4. **SSL certificates, keys, and secrets are never stored here**

## Deployment Process

During GitHub Actions deployment:
1. Templates from `ops/` are synced to the VPS using rsync
2. They are placed in their appropriate system locations (`/etc/nginx/`, etc.)
3. Services are reloaded with the new configurations
4. No VPS-specific files ever flow back to the git repository

## File Patterns to Never Commit

The following patterns are automatically ignored by `.gitignore`:
- `/etc/`
- `*.crt`
- `*.key`
- `/var/log/`
- `*.pem`
- `/opt/`
- `systemd/`
- `letsencrypt/`

## Adding New Infrastructure

When adding new VPS infrastructure:
1. Create templates in the appropriate `ops/` subdirectory
2. Update the deployment workflow to sync the new files
3. Test the deployment process thoroughly
4. Document any new configuration requirements