$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$zip = Join-Path $root '速报系统-v8审核上报H5-gitlab-source.zip'

if (Test-Path $zip) {
  Remove-Item -LiteralPath $zip -Force
}

$paths = @(
  (Join-Path $root 'src'),
  (Join-Path $root 'assets'),
  (Join-Path $root '.gitlab-ci.yml'),
  (Join-Path $root '.env.example'),
  (Join-Path $root '.gitignore'),
  (Join-Path $root 'README.md'),
  (Join-Path $root 'index.html'),
  (Join-Path $root 'metadata.json'),
  (Join-Path $root 'package.json'),
  (Join-Path $root 'pnpm-lock.yaml'),
  (Join-Path $root 'pnpm-workspace.yaml'),
  (Join-Path $root 'tsconfig.json'),
  (Join-Path $root 'vite.config.ts')
)

Compress-Archive -Path $paths -DestinationPath $zip -Force
Write-Host "Created: $zip"
