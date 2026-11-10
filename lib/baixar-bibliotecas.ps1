# Descarrega as 4 bibliotecas para esta pasta (PowerShell).
Set-Location -Path $PSScriptRoot
$b = "https://cdnjs.cloudflare.com/ajax/libs"
$ficheiros = @(
  "Chart.js/4.4.1/chart.umd.min.js",
  "jspdf/2.5.1/jspdf.umd.min.js",
  "jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",
  "xlsx/0.18.5/xlsx.full.min.js"
)
foreach ($p in $ficheiros) {
  $f = Split-Path $p -Leaf
  Write-Host "A descarregar $f ..."
  try { Invoke-WebRequest -Uri "$b/$p" -OutFile $f -UseBasicParsing }
  catch { Write-Host "FALHOU: $f" -ForegroundColor Red }
}
Get-ChildItem *.js | Select-Object Name, Length
Read-Host "Concluído. Prima Enter para fechar"
