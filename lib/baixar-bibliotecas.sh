#!/bin/sh
# Descarrega as 4 bibliotecas para esta pasta.
cd "$(dirname "$0")" || exit 1
B=https://cdnjs.cloudflare.com/ajax/libs
for p in "Chart.js/4.4.1/chart.umd.min.js" "jspdf/2.5.1/jspdf.umd.min.js" "jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js" "xlsx/0.18.5/xlsx.full.min.js"; do
  f=${p##*/}
  echo "A descarregar $f ..."
  curl -fsSL "$B/$p" -o "$f" || { echo "FALHOU: $f"; rm -f "$f"; }
done
ls -l *.js
