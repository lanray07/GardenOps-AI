Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "app-store\screenshots"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$pound = [char]0x00A3

function New-Color($hex) {
  $hex = $hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb(
    [Convert]::ToInt32($hex.Substring(0, 2), 16),
    [Convert]::ToInt32($hex.Substring(2, 2), 16),
    [Convert]::ToInt32($hex.Substring(4, 2), 16)
  )
}

function New-Brush($hex) {
  return New-Object System.Drawing.SolidBrush (New-Color $hex)
}

function New-Pen($hex, $width) {
  return New-Object System.Drawing.Pen (New-Color $hex), $width
}

function New-RectF($x, $y, $width, $height) {
  return New-Object System.Drawing.RectangleF -ArgumentList @($x, $y, $width, $height)
}

function Add-RoundedRectangle($path, $x, $y, $width, $height, $radius) {
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
}

function Fill-RoundedRect($g, $x, $y, $w, $h, $r, $brush) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRectangle $path $x $y $w $h $r
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-RoundedRect($g, $x, $y, $w, $h, $r, $pen) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-RoundedRectangle $path $x $y $w $h $r
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

function Draw-Text($g, $text, $fontSize, $style, $color, $x, $y, $w, $h, $align = "Near") {
  $font = New-Object System.Drawing.Font "Segoe UI", $fontSize, $style, ([System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::$align
  $format.LineAlignment = [System.Drawing.StringAlignment]::Near
  $format.Trimming = [System.Drawing.StringTrimming]::Word
  $format.FormatFlags = 0
  $g.DrawString($text, $font, (New-Brush $color), (New-RectF $x $y $w $h), $format)
  $font.Dispose()
  $format.Dispose()
}

function Draw-PhoneShell($g) {
  Fill-RoundedRect $g 151 470 940 1820 96 (New-Brush "#173321")
  Fill-RoundedRect $g 182 510 878 1740 74 (New-Brush "#F6FBF6")
  Fill-RoundedRect $g 510 535 220 28 14 (New-Brush "#173321")
}

function Draw-AppHeader($g, $title) {
  Draw-Text $g "GardenOps AI" 34 ([System.Drawing.FontStyle]::Bold) "#145A2B" 238 618 380 50
  Draw-Text $g $title 52 ([System.Drawing.FontStyle]::Bold) "#173321" 238 690 700 70
}

function Draw-Card($g, $x, $y, $w, $h, $title, $body, $accent = "#1F7A3B") {
  Fill-RoundedRect $g $x $y $w $h 22 (New-Brush "#FFFFFF")
  Draw-RoundedRect $g $x $y $w $h 22 (New-Pen "#DCEADD" 3)
  Draw-Text $g $title 34 ([System.Drawing.FontStyle]::Bold) "#173321" ($x + 34) ($y + 30) ($w - 68) 48
  Draw-Text $g $body 27 ([System.Drawing.FontStyle]::Regular) "#667A6D" ($x + 34) ($y + 88) ($w - 68) ($h - 110)
  Fill-RoundedRect $g ($x + $w - 90) ($y + 28) 48 48 24 (New-Brush $accent)
}

function New-Screenshot($fileName, $headline, $subhead, $screenTitle, $cards) {
  $bitmap = New-Object System.Drawing.Bitmap 1242, 2688
  $g = [System.Drawing.Graphics]::FromImage($bitmap)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear((New-Color "#F6FBF6"))

  Draw-Text $g $headline 74 ([System.Drawing.FontStyle]::Bold) "#145A2B" 96 120 1050 190
  Draw-Text $g $subhead 34 ([System.Drawing.FontStyle]::Regular) "#667A6D" 96 320 1020 110
  Draw-PhoneShell $g
  Draw-AppHeader $g $screenTitle

  $y = 810
  foreach ($card in $cards) {
    Draw-Card $g 238 $y 766 $card.Height $card.Title $card.Body $card.Accent
    $y += $card.Height + 34
  }

  Draw-Text $g "Plan. Grow. Profit." 34 ([System.Drawing.FontStyle]::Bold) "#1F7A3B" 238 2155 720 70
  $bitmap.Save((Join-Path $outDir $fileName), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bitmap.Dispose()
}

New-Screenshot "01-dashboard.png" "Run your garden from one simple dashboard" "See your plan, next tasks, and estimated monthly crop value at a glance." "Dashboard" @(
  @{ Title = "Starter Food Garden"; Body = "Herbs, salad leaves, tomatoes, and microgreens for a productive small space."; Height = 260; Accent = "#1F7A3B" },
  @{ Title = "Next 3 tasks"; Body = "Water tomatoes. Feed herbs. Check lettuce growth."; Height = 250; Accent = "#3E6FB1" },
  @{ Title = "Estimated value"; Body = "Monthly crop value estimate: ${pound}58"; Height = 220; Accent = "#F3B63F" }
)

New-Screenshot "02-planner.png" "Generate planting plans in seconds" "Enter your space, sunlight, location, crops, and budget to create a clear garden plan." "AI Garden Planner" @(
  @{ Title = "Recommended crops"; Body = "Basil, Lettuce, Tomatoes, Microgreens"; Height = 230; Accent = "#1F7A3B" },
  @{ Title = "Planting schedule"; Body = "Prepare containers, sow seeds, transplant seedlings, then stagger harvests."; Height = 270; Accent = "#3E6FB1" },
  @{ Title = "Estimated value"; Body = "Mock-first AI structure with secure backend endpoint support."; Height = 260; Accent = "#F3B63F" }
)

New-Screenshot "03-tasks.png" "Stay on top of garden jobs" "Track watering, feeding, pruning, and smart weather-based tasks." "Garden Tasks" @(
  @{ Title = "Water tomatoes"; Body = "Today - High priority"; Height = 210; Accent = "#F3B63F" },
  @{ Title = "Feed herbs"; Body = "Tomorrow - Medium priority"; Height = 210; Accent = "#3E6FB1" },
  @{ Title = "Generate Smart Tasks"; Body = "Premium demo can add weather-aware garden jobs."; Height = 270; Accent = "#1F7A3B" }
)

New-Screenshot "04-profit.png" "Estimate what your crops could be worth" "Compare crop cost, yield, resale value, and estimated profit." "Profit Mode" @(
  @{ Title = "Basil"; Body = "Cost ${pound}4. Yield 12 bunches. Profit ${pound}26."; Height = 230; Accent = "#1F7A3B" },
  @{ Title = "Tomatoes"; Body = "Cost ${pound}12. Yield 8 kg. Profit ${pound}36."; Height = 230; Accent = "#F3B63F" },
  @{ Title = "Microgreens"; Body = "Cost ${pound}8. Yield 20 trays. Profit ${pound}82."; Height = 230; Accent = "#3E6FB1" }
)

New-Screenshot "05-scanner-settings.png" "Scan plants and export your garden data" "Choose a plant image, preview care guidance, and export a JSON garden snapshot." "Scanner + Settings" @(
  @{ Title = "Plant Scanner"; Body = "Choose a plant photo, analyze it, and preview care instructions."; Height = 260; Accent = "#1F7A3B" },
  @{ Title = "Data export"; Body = "Share profile, tasks, latest plan, crop rows, and sync status."; Height = 260; Accent = "#3E6FB1" },
  @{ Title = "Firebase-ready sync"; Body = "Local demo first, with optional Firebase Auth and Firestore."; Height = 260; Accent = "#F3B63F" }
)

Write-Output "Generated App Store screenshots in $outDir"
