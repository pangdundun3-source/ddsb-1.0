param(
  [string]$Root = (Get-Location).Path,
  [int]$Port = 3000
)

# 零依赖静态文件服务器 (PowerShell 5.1 + HttpListener)
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $Root -PathType Container)) {
  throw "Root directory does not exist: $Root"
}
$Root = (Get-Item -LiteralPath $Root).FullName.TrimEnd('\')

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving '$Root' at http://localhost:$Port/  (Ctrl+C to stop)"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.ts'   = 'text/plain; charset=utf-8'
  '.tsx'  = 'text/plain; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.map'  = 'application/json; charset=utf-8'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $req = $ctx.Request
      $res = $ctx.Response

      $rawPath = $req.Url.AbsolutePath
      $rel = [Uri]::UnescapeDataString($rawPath).TrimStart('/')
      $rel = $rel -replace '/', '\'

      if ($rel -match '\.\.') { $res.StatusCode = 403; break }

      $target = if ($rel) { Join-Path $Root $rel } else { $Root }

      if ((Test-Path -LiteralPath $target -PathType Container)) {
        $target = Join-Path $target 'index.html'
      }

      if (Test-Path -LiteralPath $target -PathType Leaf) {
        $bytes = [IO.File]::ReadAllBytes($target)
        $ext = [IO.Path]::GetExtension($target).ToLower()
        $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host ("{0} 200  {1}  {2}" -f $req.HttpMethod, $rawPath, (Split-Path -Leaf $target))
      }
      else {
        $body = [Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
        $res.ContentType = 'text/plain; charset=utf-8'
        $res.StatusCode = 404
        $res.ContentLength64 = $body.Length
        $res.OutputStream.Write($body, 0, $body.Length)
        Write-Host ("{0} 404  {1}" -f $req.HttpMethod, $rawPath)
      }
    }
    catch {
      try {
        $ctx.Response.StatusCode = 500
        $ctx.Response.Close()
      } catch {}
      Write-Host "ERR: $_"
    }
    finally {
      try { $ctx.Response.Close() } catch {}
    }
  }
}
finally {
  if ($listener.IsListening) { $listener.Stop() }
  Write-Host "Stopped."
}
