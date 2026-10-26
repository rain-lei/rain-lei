[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Low')]
param([switch]$IncludeBuild)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\', '/')
$rootPrefix = $projectRoot + [IO.Path]::DirectorySeparatorChar
$cachePaths = @('.firecrawl', 'dist', 'site/.astro', 'node_modules/.cache', 'node_modules/.vite', 'site/node_modules/.vite')
if ($IncludeBuild) { $cachePaths += 'site/dist' }
$targets = @()

foreach ($relative in $cachePaths) {
    $absolute = [IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
    if (-not $absolute.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Path escapes project: $absolute"
    }
    if (-not (Test-Path -LiteralPath $absolute)) { continue }
    $resolved = (Resolve-Path -LiteralPath $absolute).ProviderPath
    if (-not $resolved.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Resolved path escapes project: $resolved"
    }
    $parent = Get-Item -LiteralPath $resolved -Force
    while ($parent.FullName -ne $projectRoot) {
        if ($parent.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            throw "Refusing a linked cache path: $($parent.FullName)"
        }
        $parent = $parent.Parent
        if (-not $parent) { throw "Cannot verify cache parent: $resolved" }
    }
    $tracked = @(& git -C $projectRoot ls-files -- $relative)
    if ($LASTEXITCODE -ne 0) { throw 'Cannot check tracked files.' }
    if ($tracked.Count) { throw "Cache contains tracked files: $relative" }
    $pending = New-Object 'System.Collections.Generic.Stack[string]'
    $pending.Push($resolved)
    $links = @()
    $size = 0L
    while ($pending.Count) {
        foreach ($child in Get-ChildItem -LiteralPath $pending.Pop() -Force) {
            if ($child.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                $links += $child
            } elseif ($child.PSIsContainer) {
                $pending.Push($child.FullName)
            } else {
                $size += $child.Length
            }
        }
    }
    $targets += [pscustomobject]@{ Path = $resolved; Bytes = $size; Links = $links }
}

$removedBytes = 0L
foreach ($target in $targets) {
    if ($PSCmdlet.ShouldProcess($target.Path, 'Remove generated cache')) {
        # Unlink junctions without visiting their targets before recursive removal.
        foreach ($link in $target.Links) {
            if ($link.PSIsContainer) { [IO.Directory]::Delete($link.FullName, $false) }
            else { [IO.File]::Delete($link.FullName) }
        }
        Remove-Item -LiteralPath $target.Path -Recurse -Force
        $removedBytes += $target.Bytes
    }
}
Write-Output ('Removed {0:N2} MB of generated cache.' -f ($removedBytes / 1000000))
