Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "assets"

function New-Color($hex) {
  $hex = $hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb(
    [Convert]::ToInt32($hex.Substring(0, 2), 16),
    [Convert]::ToInt32($hex.Substring(2, 2), 16),
    [Convert]::ToInt32($hex.Substring(4, 2), 16)
  )
}

function New-ArgbColor($alpha, $hex) {
  $base = New-Color $hex
  return [System.Drawing.Color]::FromArgb($alpha, $base.R, $base.G, $base.B)
}

function Add-RoundedRectangle($path, $x, $y, $width, $height, $radius) {
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
}

function New-Bitmap($size, $transparent = $false) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  if ($transparent) {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear((New-Color "#F6FBF6"))
  }

  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-RectF($x, $y, $width, $height) {
  return New-Object System.Drawing.RectangleF -ArgumentList @($x, $y, $width, $height)
}

function Draw-BrandMark($graphics, $size, $includeWordmark = $false) {
  $primary = New-Color "#1F7A3B"
  $primaryDark = New-Color "#145A2B"
  $leaf = New-Color "#E8F5EA"
  $accent = New-Color "#F3B63F"
  $white = [System.Drawing.Color]::White

  $scale = $size / 1024
  $cardX = 178 * $scale
  $cardY = if ($includeWordmark) { 110 * $scale } else { 178 * $scale }
  $cardSize = 668 * $scale
  $radius = 152 * $scale

  $cardPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRectangle $cardPath $cardX $cardY $cardSize $cardSize $radius
  $graphics.FillPath((New-Object System.Drawing.SolidBrush $primary), $cardPath)

  $innerPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRectangle $innerPath ($cardX + 42 * $scale) ($cardY + 42 * $scale) ($cardSize - 84 * $scale) ($cardSize - 84 * $scale) (118 * $scale)
  $graphics.DrawPath((New-Object System.Drawing.Pen (New-ArgbColor 80 "#E8F5EA"), (12 * $scale)), $innerPath)

  $stemPen = New-Object System.Drawing.Pen $white, (34 * $scale)
  $stemPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $stemPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawBezier(
    $stemPen,
    (506 * $scale), (($cardY / $scale + 565) * $scale),
    (492 * $scale), (($cardY / $scale + 472) * $scale),
    (506 * $scale), (($cardY / $scale + 374) * $scale),
    (542 * $scale), (($cardY / $scale + 286) * $scale)
  )

  $leftLeaf = New-Object System.Drawing.Drawing2D.GraphicsPath
  $leftLeaf.AddBezier(
    (500 * $scale), (($cardY / $scale + 386) * $scale),
    (340 * $scale), (($cardY / $scale + 296) * $scale),
    (304 * $scale), (($cardY / $scale + 470) * $scale),
    (456 * $scale), (($cardY / $scale + 515) * $scale)
  )
  $leftLeaf.AddBezier(
    (456 * $scale), (($cardY / $scale + 515) * $scale),
    (418 * $scale), (($cardY / $scale + 450) * $scale),
    (432 * $scale), (($cardY / $scale + 405) * $scale),
    (500 * $scale), (($cardY / $scale + 386) * $scale)
  )
  $leftLeaf.CloseFigure()
  $graphics.FillPath((New-Object System.Drawing.SolidBrush $leaf), $leftLeaf)

  $rightLeaf = New-Object System.Drawing.Drawing2D.GraphicsPath
  $rightLeaf.AddBezier(
    (544 * $scale), (($cardY / $scale + 300) * $scale),
    (690 * $scale), (($cardY / $scale + 175) * $scale),
    (778 * $scale), (($cardY / $scale + 328) * $scale),
    (638 * $scale), (($cardY / $scale + 430) * $scale)
  )
  $rightLeaf.AddBezier(
    (638 * $scale), (($cardY / $scale + 430) * $scale),
    (642 * $scale), (($cardY / $scale + 356) * $scale),
    (608 * $scale), (($cardY / $scale + 316) * $scale),
    (544 * $scale), (($cardY / $scale + 300) * $scale)
  )
  $rightLeaf.CloseFigure()
  $graphics.FillPath((New-Object System.Drawing.SolidBrush $white), $rightLeaf)

  $coinBrush = New-Object System.Drawing.SolidBrush $accent
  $graphics.FillEllipse($coinBrush, (615 * $scale), (($cardY / $scale + 514) * $scale), (130 * $scale), (130 * $scale))

  $font = New-Object System.Drawing.Font "Segoe UI", (70 * $scale), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $graphics.DrawString("GO", $font, (New-Object System.Drawing.SolidBrush $primaryDark), (New-RectF (615 * $scale) (($cardY / $scale + 524) * $scale) (130 * $scale) (110 * $scale)), $format)

  if ($includeWordmark) {
    $wordFont = New-Object System.Drawing.Font "Segoe UI", (58 * $scale), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $tagFont = New-Object System.Drawing.Font "Segoe UI", (30 * $scale), ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
    $graphics.DrawString("GardenOps AI", $wordFont, (New-Object System.Drawing.SolidBrush $primaryDark), (New-RectF 0 (816 * $scale) $size (82 * $scale)), $format)
    $graphics.DrawString("Plan. Grow. Profit.", $tagFont, (New-Object System.Drawing.SolidBrush (New-Color "#667A6D")), (New-RectF 0 (894 * $scale) $size (52 * $scale)), $format)
  }
}

function Save-Png($bitmap, $path) {
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

$icon = New-Bitmap 1024
Draw-BrandMark $icon.Graphics 1024 $false
Save-Png $icon.Bitmap (Join-Path $assets "icon.png")
$icon.Graphics.Dispose()
$icon.Bitmap.Dispose()

$adaptive = New-Bitmap 1024 $true
Draw-BrandMark $adaptive.Graphics 1024 $false
Save-Png $adaptive.Bitmap (Join-Path $assets "adaptive-icon.png")
$adaptive.Graphics.Dispose()
$adaptive.Bitmap.Dispose()

$splash = New-Bitmap 1024 $true
Draw-BrandMark $splash.Graphics 1024 $true
Save-Png $splash.Bitmap (Join-Path $assets "splash-icon.png")
$splash.Graphics.Dispose()
$splash.Bitmap.Dispose()

$favicon = New-Bitmap 48
Draw-BrandMark $favicon.Graphics 48 $false
Save-Png $favicon.Bitmap (Join-Path $assets "favicon.png")
$favicon.Graphics.Dispose()
$favicon.Bitmap.Dispose()

Write-Output "Generated GardenOps AI brand assets in $assets"
