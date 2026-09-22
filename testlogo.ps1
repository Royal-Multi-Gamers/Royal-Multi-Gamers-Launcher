Add-Type -AssemblyName System.Drawing

Get-ChildItem ".\msix-test" -Recurse -Filter "*.png" | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)

    $hasAlpha = $false

    for ($x = 0; $x -lt $img.Width -and -not $hasAlpha; $x++) {
        for ($y = 0; $y -lt $img.Height -and -not $hasAlpha; $y++) {
            $pixel = $img.GetPixel($x, $y)

            if ($pixel.A -lt 255) {
                $hasAlpha = $true
            }
        }
    }

    [PSCustomObject]@{
        File = $_.Name
        Size = "$($img.Width)x$($img.Height)"
        HasTransparency = $hasAlpha
    }

    $img.Dispose()
}