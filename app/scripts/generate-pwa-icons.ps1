$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$OutputDir = "c:/Users/neymo/OneDrive/Desktop/KVA/app/assets/icons"

function New-LedLabIcon {
  param(
    [int]$Size,
    [string]$Name,
    [string]$Glyph = "LL"
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
  $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(15, 118, 110),
    [System.Drawing.Color]::FromArgb(29, 78, 216),
    45
  )
  $graphics.FillRectangle($gradient, $rect)

  $inset = [int]($Size * 0.14)
  $overlaySize = $Size - (2 * $inset)
  $overlayRect = New-Object System.Drawing.Rectangle(
    $inset,
    $inset,
    $overlaySize,
    $overlaySize
  )
  $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 255, 255, 255))
  $graphics.FillRectangle($overlay, $overlayRect)

  $font = New-Object System.Drawing.Font(
    "Segoe UI",
    [single]($Size * 0.26),
    [System.Drawing.FontStyle]::Bold,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $stringFormat = New-Object System.Drawing.StringFormat
  $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
  $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $textRect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
  $graphics.DrawString($Glyph, $font, $brush, $textRect, $stringFormat)

  $target = Join-Path $OutputDir $Name
  $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)

  $brush.Dispose()
  $stringFormat.Dispose()
  $font.Dispose()
  $overlay.Dispose()
  $gradient.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-LedLabIcon -Size 180 -Name "apple-touch-icon.png" -Glyph "LL"
New-LedLabIcon -Size 192 -Name "icon-192.png" -Glyph "LL"
New-LedLabIcon -Size 512 -Name "icon-512.png" -Glyph "LL"
