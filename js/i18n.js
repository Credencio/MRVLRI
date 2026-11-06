/* Traduções PT / EN: interface pública, gráficos, tabelas e relatórios */
(function () {
  const T = {
    pt: {
      appName: "Land Resilience Index", appSub: "Plataforma de MRV",
      navDocs: "Documentos", docsTitle: "Documentos metodológicos", docsIntro: "Manuais, guias e outros documentos de referência do LRI para consulta e download.",
      docsPages: "págs.", docsOpen: "Abrir", docsNone: "Nenhum documento encontrado.", docsError: "Não foi possível carregar a lista de documentos.", methodDocs: "Ver documentos metodológicos para descarregar →",
      navDashboard: "Dashboard", navTech: "Área Técnica", navSubmit: "Submissão de dados", navValidate: "Validação",
      navAbout: "Sobre o LRI", aboutTitle: "Sobre o LRI",
      aboutGoalH: "Objetivo da plataforma",
      aboutGoalP: "Esta plataforma apoia a Monitoria, Reporte e Verificação (MRV) do Land Resilience Index (LRI). Reúne os dados recolhidos no terreno nos distritos de Bárue e Vanduzi (Manica, Moçambique), mas esta ainda preparada pra receber informação de LRI de outros distritos, valida-os e apresenta o estado de Capacidade Adaptativa da paisagem de forma pública e transparente, usando apenas dados validados.",
      aboutWhatP: "O LRI resume o estado da paisagem num valor de 1 a 4, organizado em três pilares (Terra, Água e Capacidade Adaptativa) e 17 indicadores.",
      aboutFlowH: "Do terreno ao Dashboard",
      af1: "Recolha", af1d: "Formulário Survey123, sem login", af2: "Camada", af2d: "ArcGIS Online: todo o registo entra Pendente", af3: "Validação", af3d: "Técnico com login valida ou rejeita",
      af4: "Cálculo", af4d: "Só registos Validados; LRI calculado no navegador", af5: "Dashboard", af5d: "Cartões, mapa, gráficos, PDF e Excel",
      aboutFlowHtml: `<p>Os dados são recolhidos através de um formulário Survey123 público e guardados no ArcGIS Online (Feature Service). Todo o novo registo entra com o estado Pendente (“Não Validado”). Um técnico, autenticado no ArcGIS Experience, passa-o a Validado ou Rejeitado. Este dashboard lê apenas os registos Validados; registos pendentes ou rejeitados nunca entram nos gráficos, tabelas ou no cálculo do LRI.</p>`,
      aboutMethH: "Metodologia", aboutPolH: "Alinhamento com políticas nacionais", aboutPolHtml: `<p>O LRI liga-se aos principais instrumentos de política nacional. O quadro mostra a que pilar e a que indicadores cada instrumento está mais associado.</p><div class="table-wrap"><table class="data pol"><thead><tr><th class="wrap">Instrumento</th><th class="wrap">Pilar principal</th><th class="wrap">Indicadores do LRI</th><th class="wrap">Ligação</th></tr></thead><tbody><tr><td class="wrap"><strong>PEDSA II</strong></td><td class="wrap">Capacidade Adaptativa</td><td class="wrap">11 Gestão Sustentável da Terra; 12 Produtividade; 14 Pobreza das famílias; 15 Cobertura do solo</td><td class="wrap">Produtividade agrícola, práticas sustentáveis e rendimento das famílias. Na Terra, pela fertilidade e pelo carbono do solo (4 e 3).</td></tr><tr><td class="wrap"><strong>Plano Nacional de Adaptação</strong></td><td class="wrap">Capacidade Adaptativa</td><td class="wrap">13 Eventos meteorológicos extremos; 17 Perceção de choques e pressões; 11 Gestão Sustentável da Terra; 9 Disponibilidade de água na paisagem</td><td class="wrap">Exposição e perceção de choques climáticos e práticas que reduzem a vulnerabilidade.</td></tr><tr><td class="wrap"><strong>Estratégia de Biodiversidade</strong></td><td class="wrap">Terra</td><td class="wrap">1 e 2 Biodiversidade acima e abaixo do solo; 16 Biodiversidade da paisagem; 3 Stocks de carbono; 15 Cobertura do solo</td><td class="wrap">Estado da biodiversidade e dos ecossistemas.</td></tr><tr><td class="wrap"><strong>Política Nacional da Água</strong></td><td class="wrap">Água</td><td class="wrap">5, 8 e 9 Disponibilidade e acesso à água; 6, 7 e 10 Qualidade da água</td><td class="wrap">Disponibilidade, acesso e qualidade da água na paisagem.</td></tr></tbody></table></div><p class="muted small">Alinhamento temático, proposto a partir dos indicadores do catálogo. Deve ser confirmado com os textos dos instrumentos.</p>`, aboutPlatH: "Onde encontrar cada coisa",
      aboutPlat: `<ul><li><a href="#dashboard">Dashboard</a>: resultados do LRI, só com dados validados.</li><li><a href="#documentos">Documentos</a>: manuais e guias metodológicos.</li><li><a href="#tecnica/submissao">Área Técnica</a>: submissão e validação de dados (acesso restrito em parte).</li></ul>`,
      secQuality: "Qualidade dos dados", qualityLink: "Ver a metodologia em Sobre o LRI",
      skip: "Saltar para o conteúdo",
      exportPdf: "Relatório PDF", exportXlsx: "Dados Excel", exportCsv: "CSV", download: "Descarregar",
      refresh: "Atualizar", updated: "Atualizado", demoBanner: "MODO DEMONSTRAÇÃO: dados fictícios apenas para pré-visualizar o layout.",
      loadError: "Não foi possível carregar os dados do Feature Service.", retry: "Tentar novamente",
      loading: "A carregar dados validados…", noData: "Sem dados validados para os filtros selecionados.",
      fYear: "Ano", fProvince: "Província", fDistrict: "Distrito", fInstitution: "Instituição", openApp: "Submeter via aplicação de campo", mapPoints: "Mostrar pontos de recolha", mapPointsN: "Pontos no mapa:", mapNoGps: "registos sem coordenadas", lat: "Latitude", lon: "Longitude", ptLegend: "Ponto = registo (cor da classe)", fAll: "Todos", fAllF: "Todas", fAllM: "Todas",
      onlyValidated: "Apenas dados validados são apresentados e usados no cálculo.",
      secLRI: "LRI geral e por pilar", lriOverall: "LRI geral", score: "Pontuação", class: "Classe", indicatorsN: "indicadores",
      secInterp: "Indicadores de apoio à interpretação",
      iDelta: "Variação do LRI face ao ano anterior", iPoor: "Indicadores na classe Fraco", iGap: "Lacuna até à próxima classe",
      iWeak: "Pilar mais fraco", iCover: "Cobertura geográfica", iPrio: "Prioridades de intervenção", iStrong: "Pontos fortes",
      noPrev: "Sem ano anterior para comparar", vs: "face a", none: "Nenhum", toReach: "para atingir a classe", topClass: "Já está na classe máxima",
      districtsCovered: "distritos com dados", provincesWord: "província(s)", indCovered: "indicadores com dados",
      prioText: "Reforçar ações nos indicadores com pontuação abaixo de 2,5, começando pelos mais baixos:",
      prioNone: "Nenhum indicador abaixo de 2,5.", strongText: "Indicadores com pontuação ≥ 2,5 (classe Bom ou Excelente):", strongNone: "Ainda sem indicadores nas classes Bom/Excelente.",
      secIndBar: "Pontuação por indicador", secClassPie: "Distribuição por classe", secRadar: "Radar por indicador",
      xHint: "Dica: clique nos gráficos, no mapa, nos cartões e nas tabelas para filtrar o resto do painel.", xActive: "Filtros activos:", xClear: "Limpar filtros", xRemove: "Remover filtro", xClickHint: "Clique para filtrar",
      sheetInst: "Instituições", secInst: "Contribuição das instituições para o LRI", instSub: "Número de distritos com informação de LRI validada lançada por cada instituição; a percentagem é a parte de cada instituição no total de distritos lançados por todas.", instAxis: "N.º de distritos", instDistricts: "Distritos", instNone: "Sem instituição", instNote: "Cobertura total:", instDistrictsWord: "distritos", instWord: "instituições",
      iBase: "Mudança face ao baseline", blCurrent: "Atual", blScope: "Comparação feita apenas sobre os distritos com baseline (Bárue e Vanduzi). Os valores de baseline são da paisagem (Bárue + Vanduzi).", noBase: "Este distrito não tem baseline.", noBaseCmp: "Ainda não há dados validados dos distritos com baseline para comparar.", docBaseline: "Baseline",
      mapTitle: "Mapa do LRI por distrito", mapSub: "Cada distrito é pintado com a classe do LRI geral (apenas dados validados). Clique num distrito para ver os detalhes.", mapList: "Distritos com dados", mapNoData: "Sem dados validados", mapRecords: "Registos", mapHint: "Clique num distrito do mapa ou da lista.", mapUnmatched: "Distritos sem correspondência no mapa:",
      secDistPillar: "Comparação por distrito e pilar", secEvolution: "Evolução do LRI", secHeat: "Mapa de calor: indicador e sub-indicador × distrito",
      heatByDistrict: "Por distrito (e total)", heatByYear: "Por ano", total: "Total",
      secSubTable: "Detalhe dos sub-indicadores", secIndTable: "Detalhe dos indicadores",
      secValDist: "Distribuição dos valores", secScoreDist: "Distribuição das pontuações dos sub-indicadores por pilar",
      secRecords: "Registos / dados", secMethod: "Metodologia e qualidade dos dados",
      subIndicator: "Sub-indicador", chooseSub: "Sub-indicador", nRecords: "N.º de registos", valueRange: "Intervalo de valores",
      pillar: "Pilar", indicator: "Indicador", meanValue: "Valor médio", scoreCol: "Pontuação", classCol: "Classe", nCol: "n",
      province: "Província", district: "Distrito", value: "Valor", unit: "Unidade", source: "Fonte", season: "Época", collectDate: "Data de coleta",
      submitDate: "Data de submissão", institution: "Instituição", status: "Estado", id: "ID", year: "Ano",
      search: "Pesquisar…", page: "Página", of: "de", prev: "Anterior", next: "Seguinte", rows: "registos",
      poor: "Fraco", moderate: "Moderado", good: "Bom", excellent: "Excelente",
      pending: "Pendente", validated: "Validado", rejected: "Rejeitado",
      yAxisScore: "Pontuação (1–4)", xAxisValue: "Valor", yAxisCount: "N.º de registos", xAxisScore: "Pontuação",
      subsCount: "sub-indicadores", assumedWarn: "Regra assumida (texto do sub-indicador não reconhecido)",
      mixedUnits: "(vários)",
      techTitle: "Área técnica", techIntro: "Recolha e validação de dados. Novos registos entram como Pendente; só passam ao Dashboard depois de validados.",
      flowSubmit: "Submissão", flowSubmitD: "Sem login: formulário Survey123", flowPending: "Pendente", flowPendingD: "Todo o novo registo",
      flowValidate: "Validação", flowValidateD: "Técnico com login ArcGIS", flowDash: "Dashboard", flowDashD: "Só dados Validados",
      tabSubmit: "Submissão de dados", tabTable: "Submissão usando tabela ↗", tabTableTip: "Abre numa nova janela (área restrita, pede palavra-passe)", tabValidate: "Validação de dados",
      guideTitle: "Como usar esta área", guideWho: "Quem pode usar", guideFor: "Para que serve", guideHow: "Como usar",
      g1Name: "1. Submissão de dados", g1Who: "Qualquer pessoa que recolhe dados no terreno. Não pede login.", g1For: "Enviar um registo de LRI (distrito, indicador, sub-indicador, valor, data e instituição) pelo formulário Survey123.", g1How: "Abra o separador «Submissão de dados», preencha o formulário e envie. O registo entra como Pendente e só aparece no Dashboard depois de validado.",
      g2Name: "2. Submissão usando tabela", g2Who: "Só técnicos com acesso autorizado. É uma área restrita e pede palavra-passe.", g2For: "Trabalhar os registos diretamente na tabela da camada, em vez de preencher o formulário um a um.", g2How: "Clique em «Submissão usando tabela»: abre numa nova janela. Entre com a palavra-passe que lhe foi dada.",
      g3Name: "3. Validação de dados", g3Who: "Só o técnico validador, com conta ArcGIS Online. Pede login.", g3For: "Rever os registos Pendentes e decidir quais entram no LRI.", g3How: "Abra o separador «Validação de dados», entre com a sua conta, analise cada registo e mude o estado para Validado (entra no Dashboard) ou Regeitado (fica de fora). Se o login falhar dentro da página, use «Abrir em nova janela».",
      submitHead: "Submissão de dados (Survey123)", submitDesc: "Formulário público: não é necessário login. O registo é guardado como Pendente.",
      validateHead: "Validação de dados (ArcGIS Experience)", validateDesc: "Acesso restrito: inicie sessão com utilizador e palavra-passe do ArcGIS Online. Validado → aparece no Dashboard · Rejeitado → fica fora do Dashboard.",
      openNew: "Abrir em nova janela", embedHint: "Se o formulário não carregar aqui (bloqueio de cookies de terceiros no navegador), use “Abrir em nova janela”.",
      statusCounts: "Estado dos registos na base de dados",
      devBy: "Desenvolvido por",
      footer: "Land Resilience Index · MRV · Os valores apresentados resultam apenas de registos validados.",
      pdfTitle: "Relatório do Land Resilience Index (LRI)", pdfGenerated: "Gerado em", pdfFilters: "Filtros", pdfPage: "Página",
      pdfCharts: "Gráficos", generating: "A gerar…",
      sheetSummary: "Resumo", sheetPillars: "Pilares", sheetInd: "Indicadores", sheetSub: "Sub-indicadores", sheetRec: "Registos", sheetHeat: "Mapa de calor",
      methodHtml: `
<h3>Cálculo do LRI</h3>
<ol>
<li><strong>Pontuação do sub-indicador:</strong> calcula-se o valor médio dos registos validados e converte-se numa pontuação de 1 a 4 com os limiares de classificação definidos para cada sub-indicador (ficheiro de referência SUSTAIN LHMI): 1 = Fraco, 2 = Moderado, 3 = Bom, 4 = Excelente.</li>
<li><strong>Pontuação do indicador:</strong> média simples das pontuações dos seus sub-indicadores com dados.</li>
<li><strong>Pontuação do pilar</strong> (Terra, Água, Capacidade Adaptativa): média simples das pontuações dos seus indicadores com dados.</li>
<li><strong>LRI geral:</strong> média simples das pontuações dos pilares com dados.</li>
</ol>
<p><strong>Classes do LRI:</strong> Fraco &lt; 1,50 · Moderado 1,50–2,49 · Bom 2,50–3,49 · Excelente ≥ 3,50.</p>
<h3>Indicadores de apoio à interpretação</h3>
<p>A <em>variação</em> compara o LRI do ano em análise com o do ano anterior com dados; a <em>lacuna</em> é a diferença entre o LRI e o limite inferior da classe seguinte; as <em>prioridades de intervenção</em> são os indicadores com pontuação inferior a 2,5 (até cinco, dos mais baixos); os <em>pontos fortes</em> são os indicadores com pontuação ≥ 2,5. O ano de cada registo é o da data de coleta (ou, na falta desta, da data de submissão).</p>
<h3>Qualidade dos dados e limitações</h3>
<ul>
<li>O LRI só é tão representativo quanto a cobertura: o n.º de indicadores, sub-indicadores e distritos com dados validados é apresentado nos cartões e tabelas. Indicadores sem dados <strong>não</strong> contam como zero: ficam fora da média.</li>
<li>Cada sub-indicador depende do número de registos (<em>n</em>); médias com n baixo devem ser interpretadas com cautela.</li>
<li>Registos cujo indicador ou sub-indicador não é reconhecido pelo catálogo ficam excluídos do cálculo; quando só o sub-indicador não é reconhecido, é aplicada a regra do primeiro sub-indicador do indicador e o registo é sinalizado.</li>
<li>O indicador “Valor médio” só é apresentado quando o indicador tem um único sub-indicador (unidades comparáveis).</li>
<li>A validação é uma verificação técnica manual; a plataforma não corrige valores.</li>
</ul>`
    },
    en: {
      appName: "Land Resilience Index", appSub: "MRV platform",
      navDocs: "Documents", docsTitle: "Methodological documents", docsIntro: "LRI handbooks, guides and other reference documents to read and download.",
      docsPages: "pp.", docsOpen: "Open", docsNone: "No documents found.", docsError: "Could not load the document list.", methodDocs: "See methodological documents to download →",
      navDashboard: "Dashboard", navTech: "Technical Area", navSubmit: "Data submission", navValidate: "Validation",
      navAbout: "About LRI", aboutTitle: "About LRI",
      aboutGoalH: "Purpose of the platform",
      aboutGoalP: "This platform supports the Monitoring, Reporting and Verification (MRV) of the Land Resilience Index (LRI). It gathers the data collected in the field in the districts of Bárue and Vanduzi (Manica, Mozambique), but this one is still prepared to receive LRI information from other districts, validates it and presents the state of landscape Adaptive Capacity publicly and transparently, using validated data only.",
      aboutWhatP: "The LRI summarises the state of the landscape in a value from 1 to 4, organised in three pillars (Land, Water and Adaptive Capacity) and 17 indicators.",
      aboutFlowH: "From the field to the Dashboard",
      af1: "Collection", af1d: "Survey123 form, no login", af2: "Layer", af2d: "ArcGIS Online: every record enters Pending", af3: "Validation", af3d: "Technician with login validates or rejects",
      af4: "Calculation", af4d: "Validated records only; LRI computed in the browser", af5: "Dashboard", af5d: "Cards, map, charts, PDF and Excel",
      aboutFlowHtml: `<p>Data is collected through a public Survey123 form and stored in ArcGIS Online (Feature Service). Every new record enters as Pending (“Não Validado”). A technician, signed in to the ArcGIS Experience, sets it to Validated or Rejected. This dashboard reads only Validated records; pending or rejected records never reach the charts, tables or the LRI calculation.</p>`,
      aboutMethH: "Methodology", aboutPolH: "Alignment with national policies", aboutPolHtml: `<p>The LRI is linked to the main national policy instruments. The table shows which pillar and indicators each instrument is most closely associated with.</p><div class="table-wrap"><table class="data pol"><thead><tr><th class="wrap">Instrument</th><th class="wrap">Main pillar</th><th class="wrap">LRI indicators</th><th class="wrap">Link</th></tr></thead><tbody><tr><td class="wrap"><strong>PEDSA II</strong></td><td class="wrap">Adaptive Capacity</td><td class="wrap">11 Sustainable Land Management; 12 Productivity; 14 Household poverty; 15 Ground cover</td><td class="wrap">Agricultural productivity, sustainable practices and household income. In Land, through soil fertility and carbon (4 and 3).</td></tr><tr><td class="wrap"><strong>National Adaptation Plan</strong></td><td class="wrap">Adaptive Capacity</td><td class="wrap">13 Extreme weather events; 17 Perception of shocks and pressures; 11 Sustainable Land Management; 9 Landscape water availability</td><td class="wrap">Exposure to and perception of climate shocks, and practices that reduce vulnerability.</td></tr><tr><td class="wrap"><strong>Biodiversity Strategy</strong></td><td class="wrap">Land</td><td class="wrap">1 and 2 Above- and below-ground biodiversity; 16 Landscape biodiversity; 3 Carbon stocks; 15 Ground cover</td><td class="wrap">State of biodiversity and ecosystems.</td></tr><tr><td class="wrap"><strong>National Water Policy</strong></td><td class="wrap">Water</td><td class="wrap">5, 8 and 9 Water availability and access; 6, 7 and 10 Water quality</td><td class="wrap">Water availability, access and quality across the landscape.</td></tr></tbody></table></div>`, aboutPlatH: "Where to find what",
      aboutPlat: `<ul><li><a href="#dashboard">Dashboard</a>: LRI results, from validated data only.</li><li><a href="#documentos">Documents</a>: methodological handbooks and guides.</li><li><a href="#tecnica/submissao">Technical Area</a>: data submission and validation (partly restricted access).</li></ul>`,
      secQuality: "Data quality", qualityLink: "See the methodology in About LRI",
      skip: "Skip to content",
      exportPdf: "PDF report", exportXlsx: "Excel data", exportCsv: "CSV", download: "Download",
      refresh: "Refresh", updated: "Updated", demoBanner: "DEMO MODE: fictitious data, only to preview the layout.",
      loadError: "Could not load data from the Feature Service.", retry: "Try again",
      loading: "Loading validated data…", noData: "No validated data for the selected filters.",
      fYear: "Year", fProvince: "Province", fDistrict: "District", fInstitution: "Institution", openApp: "Submit via field app", mapPoints: "Show collection points", mapPointsN: "Points on the map:", mapNoGps: "records without coordinates", lat: "Latitude", lon: "Longitude", ptLegend: "Dot = record (class colour)", fAll: "All", fAllF: "All", fAllM: "All",
      onlyValidated: "Only validated data is shown and used in the calculation.",
      secLRI: "Overall LRI and by pillar", lriOverall: "Overall LRI", score: "Score", class: "Class", indicatorsN: "indicators",
      secInterp: "Interpretation support indicators",
      iDelta: "LRI change vs previous year", iPoor: "Indicators in the Poor class", iGap: "Gap to next class",
      iWeak: "Weakest pillar", iCover: "Geographic coverage", iPrio: "Intervention priorities", iStrong: "Strengths",
      noPrev: "No previous year to compare", vs: "vs", none: "None", toReach: "to reach class", topClass: "Already in the top class",
      districtsCovered: "districts with data", provincesWord: "province(s)", indCovered: "indicators with data",
      prioText: "Strengthen action on indicators scoring below 2.5, starting with the lowest:",
      prioNone: "No indicator below 2.5.", strongText: "Indicators scoring ≥ 2.5 (Good or Excellent class):", strongNone: "No indicators in the Good/Excellent classes yet.",
      secIndBar: "Score by indicator", secClassPie: "Distribution by class", secRadar: "Radar by indicator",
      xHint: "Tip: click charts, the map, cards and tables to filter the rest of the dashboard.", xActive: "Active filters:", xClear: "Clear filters", xRemove: "Remove filter", xClickHint: "Click to filter",
      sheetInst: "Institutions", secInst: "Institutions' contribution to the LRI", instSub: "Number of districts with validated LRI data submitted by each institution; the percentage is each institution's share of the districts submitted by all institutions.", instAxis: "No. of districts", instDistricts: "Districts", instNone: "No institution", instNote: "Total coverage:", instDistrictsWord: "districts", instWord: "institutions",
      iBase: "Change vs baseline", blCurrent: "Current", blScope: "Comparison made only over the districts that have a baseline (Bárue and Vanduzi). Baseline values are landscape-level (Bárue + Vanduzi).", noBase: "This district has no baseline.", noBaseCmp: "There is no validated data yet from the baseline districts to compare.", docBaseline: "Baseline",
      mapTitle: "LRI map by district", mapSub: "Each district is coloured by its overall LRI class (validated data only). Click a district for details.", mapList: "Districts with data", mapNoData: "No validated data", mapRecords: "Records", mapHint: "Click a district on the map or in the list.", mapUnmatched: "Districts not matched on the map:",
      secDistPillar: "Comparison by district and pillar", secEvolution: "LRI trend", secHeat: "Heatmap: indicator and sub-indicator × district",
      heatByDistrict: "By district (and total)", heatByYear: "By year", total: "Total",
      secSubTable: "Sub-indicator detail", secIndTable: "Indicator detail",
      secValDist: "Value distribution", secScoreDist: "Sub-indicator score distribution by pillar",
      secRecords: "Records / data", secMethod: "Methodology and data quality",
      subIndicator: "Sub-indicator", chooseSub: "Sub-indicator", nRecords: "No. of records", valueRange: "Value range",
      pillar: "Pillar", indicator: "Indicator", meanValue: "Mean value", scoreCol: "Score", classCol: "Class", nCol: "n",
      province: "Province", district: "District", value: "Value", unit: "Unit", source: "Source", season: "Season", collectDate: "Collection date",
      submitDate: "Submission date", institution: "Institution", status: "Status", id: "ID", year: "Year",
      search: "Search…", page: "Page", of: "of", prev: "Previous", next: "Next", rows: "records",
      poor: "Poor", moderate: "Moderate", good: "Good", excellent: "Excellent",
      pending: "Pending", validated: "Validated", rejected: "Rejected",
      yAxisScore: "Score (1–4)", xAxisValue: "Value", yAxisCount: "No. of records", xAxisScore: "Score",
      subsCount: "sub-indicators", assumedWarn: "Assumed rule (sub-indicator text not recognised)",
      mixedUnits: "(various)",
      techTitle: "Technical area", techIntro: "Data collection and validation. New records enter as Pending and only reach the Dashboard once validated.",
      flowSubmit: "Submission", flowSubmitD: "No login: Survey123 form", flowPending: "Pending", flowPendingD: "Every new record",
      flowValidate: "Validation", flowValidateD: "Technician with ArcGIS login", flowDash: "Dashboard", flowDashD: "Validated data only",
      tabSubmit: "Data submission", tabTable: "Submission using a table ↗", tabTableTip: "Opens in a new window (restricted area, password required)", tabValidate: "Data validation",
      guideTitle: "How to use this area", guideWho: "Who can use it", guideFor: "What it is for", guideHow: "How to use it",
      g1Name: "1. Data submission", g1Who: "Anyone collecting data in the field. No login required.", g1For: "Send an LRI record (district, indicator, sub-indicator, value, date and institution) through the Survey123 form.", g1How: "Open the “Data submission” tab, fill in the form and submit. The record enters as Pending and only appears on the Dashboard once validated.",
      g2Name: "2. Submission using a table", g2Who: "Authorised technicians only. It is a restricted area and asks for a password.", g2For: "Work on the records directly in the layer table, instead of filling in the form one by one.", g2How: "Click “Submission using a table”: it opens in a new window. Sign in with the password you were given.",
      g3Name: "3. Data validation", g3Who: "The validating technician only, with an ArcGIS Online account. Login required.", g3For: "Review Pending records and decide which ones enter the LRI.", g3How: "Open the “Data validation” tab, sign in, check each record and set its status to Validated (reaches the Dashboard) or Rejected (left out). If login fails inside the page, use “Open in new window”.",
      submitHead: "Data submission (Survey123)", submitDesc: "Public form: no login required. The record is saved as Pending.",
      validateHead: "Data validation (ArcGIS Experience)", validateDesc: "Restricted access: sign in with an ArcGIS Online username and password. Validated → appears on the Dashboard · Rejected → stays off the Dashboard.",
      openNew: "Open in new window", embedHint: "If the form does not load here (third-party cookies blocked by your browser), use “Open in new window”.",
      statusCounts: "Record status in the database",
      devBy: "Developed by",
      footer: "Land Resilience Index · MRV · Figures shown come from validated records only.",
      pdfTitle: "Land Resilience Index (LRI) report", pdfGenerated: "Generated on", pdfFilters: "Filters", pdfPage: "Page",
      pdfCharts: "Charts", generating: "Generating…",
      sheetSummary: "Summary", sheetPillars: "Pillars", sheetInd: "Indicators", sheetSub: "Sub-indicators", sheetRec: "Records", sheetHeat: "Heatmap",
      methodHtml: `
<h3>LRI calculation</h3>
<ol>
<li><strong>Sub-indicator score:</strong> the mean value of validated records is converted into a 1–4 score using the classification thresholds defined for each sub-indicator (SUSTAIN LHMI reference file): 1 = Poor, 2 = Moderate, 3 = Good, 4 = Excellent.</li>
<li><strong>Indicator score:</strong> simple mean of the scores of its sub-indicators with data.</li>
<li><strong>Pillar score</strong> (Land, Water, Adaptive Capacity): simple mean of the scores of its indicators with data.</li>
<li><strong>Overall LRI:</strong> simple mean of the pillar scores with data.</li>
</ol>
<p><strong>LRI classes:</strong> Poor &lt; 1.50 · Moderate 1.50–2.49 · Good 2.50–3.49 · Excellent ≥ 3.50.</p>
<h3>Interpretation support indicators</h3>
<p><em>Change</em> compares the LRI of the year under analysis with the previous year that has data; the <em>gap</em> is the difference between the LRI and the lower bound of the next class; <em>intervention priorities</em> are indicators scoring below 2.5 (up to five, lowest first); <em>strengths</em> are indicators scoring ≥ 2.5. A record’s year is that of its collection date (or, if missing, its submission date).</p>
<h3>Data quality and limitations</h3>
<ul>
<li>The LRI is only as representative as its coverage: the number of indicators, sub-indicators and districts with validated data is shown in the cards and tables. Indicators without data do <strong>not</strong> count as zero: they are left out of the average.</li>
<li>Each sub-indicator depends on its number of records (<em>n</em>); means with low n should be read with caution.</li>
<li>Records whose indicator or sub-indicator is not recognised by the catalogue are excluded from the calculation; when only the sub-indicator is unrecognised, the rule of the indicator’s first sub-indicator is applied and the record is flagged.</li>
<li>“Mean value” for an indicator is shown only when it has a single sub-indicator (comparable units).</li>
<li>Validation is a manual technical check; the platform does not correct values.</li>
</ul>`
    }
  };

  let lang = "pt";
  try { lang = localStorage.getItem("lri_lang") || "pt"; } catch (e) {}
  if (lang !== "pt" && lang !== "en") lang = "pt";

  const t = (k) => (T[lang] && T[lang][k] != null ? T[lang][k] : k);
  const pick = (o) => (lang === "en" ? o.en : o.pt);
  const cls = (k) => t(k);
  const fmt = (n, d) => (n == null || isNaN(n) ? "–" : Number(n).toLocaleString(lang === "en" ? "en-GB" : "pt-PT", { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }));
  const fmtDate = (d) => (d ? d.toLocaleDateString(lang === "en" ? "en-GB" : "pt-PT") : "");

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.getAttribute("data-i18n-title")); });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang));
    document.title = t("appName") + " · MRV";
  }
  function set(l) { lang = l; try { localStorage.setItem("lri_lang", l); } catch (e) {} apply(); window.dispatchEvent(new Event("lri-lang")); }

  window.I18N = { t, pick, cls, fmt, fmtDate, apply, set, get lang() { return lang; } };
})();
