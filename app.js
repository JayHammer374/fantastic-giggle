const projectForm = document.querySelector('.project-form');
const pageHeading = document.querySelector('#page-heading');
const newProjectWorkspace = document.querySelector('#new-project-workspace');
const projectLibrary = document.querySelector('#planes');
const projectLibraryList = document.querySelector('#project-library-list');
const projectLibraryCount = document.querySelector('#project-library-count');
const projectLibraryEmpty = document.querySelector('#project-library-empty');
const saveProjectButton = document.querySelector('#save-project');
const newProjectFromLibraryButton = document.querySelector('#new-project-from-library');
const newPlanNavigation = document.querySelector('#nav-new-plan');
const myProjectsNavigation = document.querySelector('#nav-my-projects');
const planResult = document.querySelector('#plan-result');
const planTitle = document.querySelector('#generated-plan-title');
const planObjective = document.querySelector('#generated-objective');
const projectFacts = document.querySelector('#project-facts');
const generatedPhases = document.querySelector('#generated-phases');
const generateAiPlanButton = document.querySelector('#generate-ai-plan');
const printPlanButton = document.querySelector('#print-plan');
const aiFeedback = document.querySelector('#ai-feedback');
const draftStatus = document.querySelector('#draft-status');
const isoChecklist = document.querySelector('#iso-checklist');
const isoProgress = document.querySelector('#iso-progress');
const isoProgressBar = document.querySelector('#iso-progress-bar');
const budgetLines = document.querySelector('#budget-lines');
const addBudgetLineButton = document.querySelector('#add-budget-line');
const paretoInputs = document.querySelector('#pareto-inputs');
const addParetoEntryButton = document.querySelector('#add-pareto-entry');
const paretoResults = document.querySelector('#pareto-results');
const paretoTotal = document.querySelector('#pareto-total');
const paretoInsight = document.querySelector('#pareto-insight');
const resourceAssignments = document.querySelector('#resource-assignments');
const addResourceAssignmentButton = document.querySelector('#add-resource-assignment');
const resourceSummary = document.querySelector('#resource-summary');
const legalChecklist = document.querySelector('#legal-checklist');
const legalProgress = document.querySelector('#legal-progress');
const legalProgressBar = document.querySelector('#legal-progress-bar');
const budgetImportFile = document.querySelector('#budget-import-file');
const importBudgetQuotesButton = document.querySelector('#import-budget-quotes');
const exportBudgetTemplateButton = document.querySelector('#export-budget-template');
const exportBudgetQuotesButton = document.querySelector('#export-budget-quotes');
const budgetImportStatus = document.querySelector('#budget-import-status');
const secopQuery = document.querySelector('#secop-query');
const secopDepartment = document.querySelector('#secop-department');
const searchSecopButton = document.querySelector('#search-secop');
const secopStatus = document.querySelector('#secop-status');
const secopResults = document.querySelector('#secop-results');
const localDraftKey = 'proyecto-claro:draft:v1';
const localProjectsKey = 'proyecto-claro:projects:v1';
let budgetLineCount = 0;
let paretoEntryCount = 0;
let resourceAssignmentCount = 0;
let restoringDraft = false;
let currentGeneratedPlan = null;
let currentProjectId = null;

const phaseTemplates = [
  {
    name: 'Planear',
    marker: 'P',
    className: 'phase-plan',
    activities: ['Precisar alcance y resultados esperados', 'Definir recursos, presupuesto y responsables', 'Identificar requisitos y riesgos iniciales'],
  },
  {
    name: 'Hacer',
    marker: 'H',
    className: 'phase-do',
    activities: ['Desglosar el trabajo en actividades', 'Asignar responsables y fechas', 'Ejecutar el plan y registrar evidencias'],
  },
  {
    name: 'Verificar',
    marker: 'V',
    className: 'phase-check',
    activities: ['Definir indicadores y metas', 'Revisar avances frente al plan', 'Documentar desviaciones y hallazgos'],
  },
  {
    name: 'Actuar',
    marker: 'A',
    className: 'phase-act',
    activities: ['Priorizar acciones correctivas', 'Asignar responsables de mejora', 'Actualizar el plan con lo aprendido'],
  },
];

const budgetUnits = ['Unidad', 'Hora', 'Jornada', 'm', 'm2', 'm3', 'kg', 'Litro', 'Servicio'];

const isoChecklistItems = [
  {
    category: 'Contexto y alcance',
    description: 'Identificar necesidades relevantes y delimitar alcance, entregables y exclusiones.',
  },
  {
    category: 'Responsables y recursos',
    description: 'Asignar responsables, recursos y autoridad para las actividades del proyecto.',
  },
  {
    category: 'Informacion documentada',
    description: 'Definir como crear, revisar, identificar y conservar documentos y evidencias.',
  },
  {
    category: 'Ejecucion y cambios',
    description: 'Registrar criterios de aceptacion, actividades realizadas y cambios autorizados.',
  },
  {
    category: 'Seguimiento',
    description: 'Definir indicadores, metas, frecuencia de revision y responsables del seguimiento.',
  },
  {
    category: 'Mejora',
    description: 'Registrar desviaciones, acciones correctivas y verificacion de resultados.',
  },
];

const legalChecklistItems = [
  {
    area: 'Permisos y autorizaciones',
    question: '¿La ubicacion o actividad requiere permisos, licencias o conceptos de una entidad competente?',
  },
  {
    area: 'Contratacion y obligaciones',
    question: '¿Se definieron modalidad contractual, alcance, entregables, aceptacion y control de cambios?',
  },
  {
    area: 'Trabajo y seguridad',
    question: '¿Se revisaron las obligaciones aplicables a trabajadores, contratistas y seguridad en el trabajo?',
  },
  {
    area: 'Impuestos y facturacion',
    question: '¿Se validaron impuestos, retenciones y requisitos de facturacion con apoyo contable?',
  },
  {
    area: 'Datos personales',
    question: '¿El proyecto trata datos personales y necesita controles, avisos o autorizaciones?',
  },
  {
    area: 'Polizas y garantias',
    question: '¿El contrato, entidad o modalidad exige polizas o garantias especificas?',
  },
  {
    area: 'Ambiente y territorio',
    question: '¿La actividad requiere validar permisos ambientales, uso del suelo o restricciones territoriales?',
  },
];

function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function addFact(label, value) {
  const fact = document.createElement('div');
  fact.className = 'project-fact';
  addTextElement(fact, 'dt', '', label);
  addTextElement(fact, 'dd', '', value || 'Por definir');
  projectFacts.append(fact);
}

function renderPhase(phase) {
  const article = document.createElement('article');
  article.className = `generated-phase ${phase.className}`;

  const heading = document.createElement('div');
  heading.className = 'generated-phase-heading';
  addTextElement(heading, 'span', 'phase-symbol', phase.marker).setAttribute('aria-hidden', 'true');
  addTextElement(heading, 'h3', '', phase.name);
  article.append(heading);
  if (phase.objective) {
    addTextElement(article, 'p', 'generated-phase-objective', phase.objective);
  }

  const activities = document.createElement('ol');
  for (const activity of phase.activities) {
    addTextElement(activities, 'li', '', activity);
  }
  article.append(activities);
  generatedPhases.append(article);
}

function isValidGeneratedPlan(plan) {
  const expectedPhases = ['Planear', 'Hacer', 'Verificar', 'Actuar'];
  return Boolean(
    plan
    && typeof plan.overview === 'string'
    && Array.isArray(plan.phases)
    && plan.phases.length === expectedPhases.length
    && plan.phases.every((phase, index) => (
      phase.phase === expectedPhases[index]
      && typeof phase.objective === 'string'
      && Array.isArray(phase.activities)
      && phase.activities.every((activity) => typeof activity === 'string')
    ))
  );
}

function renderGeneratedPlan(plan) {
  currentGeneratedPlan = plan;
  planObjective.textContent = plan.overview;
  generatedPhases.replaceChildren();

  for (const phase of plan.phases) {
    const template = phaseTemplates.find((item) => item.name === phase.phase);
    renderPhase({ ...template, objective: phase.objective, activities: phase.activities });
  }
}

function createTemplatePlan(overview) {
  return {
    mode: 'template',
    overview,
    phases: phaseTemplates.map((phase) => ({
      phase: phase.name,
      objective: '',
      activities: phase.activities,
    })),
  };
}

async function generatePlanWithAI() {
  if (!projectForm.reportValidity()) {
    return;
  }

  generateAiPlanButton.disabled = true;
  generateAiPlanButton.textContent = 'Generando...';
  aiFeedback.hidden = false;
  aiFeedback.classList.remove('is-error');
  aiFeedback.textContent = 'Solicitando una propuesta al backend IA...';
  draftStatus.textContent = 'Generando plan con IA';

  const formData = new FormData(projectForm);
  const sectorField = projectForm.elements.namedItem('project-sector');
  const budgetValue = formData.get('project-budget');
  const durationValue = formData.get('project-duration');
  const project = {
    project_name: formData.get('project-name').trim(),
    sector: sectorField.options[sectorField.selectedIndex].text,
    location: formData.get('project-location').trim(),
    estimated_budget_cop: budgetValue ? Math.trunc(Number(budgetValue)) : null,
    estimated_duration_weeks: durationValue ? Math.trunc(Number(durationValue)) : null,
    objective: formData.get('project-objective').trim(),
  };

  try {
    const response = await fetch('/api/v1/plans/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('El backend devolvio una respuesta no valida.');
    }
    if (!response.ok) {
      throw new Error(result.detail || `El backend respondio con estado ${response.status}.`);
    }
    if (!isValidGeneratedPlan(result)) {
      throw new Error('El backend devolvio una estructura PHVA no valida.');
    }

    renderGeneratedPlan({ ...result, mode: 'ai' });
    aiFeedback.textContent = 'Borrador IA recibido. Revisa actividades, supuestos y requisitos antes de usarlo.';
    draftStatus.textContent = 'Borrador IA guardado en este navegador';
    saveDraftState();
  } catch (error) {
    aiFeedback.classList.add('is-error');
    aiFeedback.textContent = error instanceof TypeError
      ? 'No se pudo conectar con el backend. Inicia el contenedor Proyecto Claro.'
      : error.message;
    draftStatus.textContent = 'No se pudo generar el plan con IA';
  } finally {
    generateAiPlanButton.disabled = false;
    generateAiPlanButton.textContent = 'Generar con IA';
  }
}

function updateIsoProgress() {
  const completedItems = isoChecklist.querySelectorAll('input[type="checkbox"]:checked').length;
  isoProgress.textContent = `${completedItems} de ${isoChecklistItems.length} completados`;
  isoProgressBar.value = completedItems;
}

function updateLegalProgress() {
  const statuses = Array.from(legalChecklist.querySelectorAll('select')).map((select) => select.value);
  const verified = statuses.filter((status) => status === 'verified').length;
  const notApplicable = statuses.filter((status) => status === 'not-applicable').length;
  const reviewed = verified + notApplicable;
  legalProgress.textContent = `${reviewed} de ${legalChecklistItems.length} revisados (${verified} verificados, ${notApplicable} no aplican)`;
  legalProgressBar.value = reviewed;
}

function renderLegalChecklist() {
  legalChecklist.replaceChildren();

  legalChecklistItems.forEach((item, index) => {
    const row = document.createElement('li');
    row.className = 'legal-check-item';

    const description = document.createElement('div');
    description.className = 'legal-check-copy';
    addTextElement(description, 'strong', '', item.area);
    addTextElement(description, 'span', '', item.question);

    const select = document.createElement('select');
    select.className = 'legal-status';
    select.setAttribute('aria-label', `Estado: ${item.area}`);
    select.dataset.legalIndex = String(index);
    for (const [value, label] of [['pending', 'Pendiente'], ['verified', 'Verificado'], ['not-applicable', 'No aplica']]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.append(option);
    }

    row.append(description, select);
    legalChecklist.append(row);
  });

  updateLegalProgress();
}

function renderIsoChecklist() {
  isoChecklist.replaceChildren();

  isoChecklistItems.forEach((item, index) => {
    const row = document.createElement('li');
    row.className = 'iso-check-item';

    const label = document.createElement('label');
    label.className = 'iso-check-label';
    label.htmlFor = `iso-control-${index + 1}`;

    const checkbox = document.createElement('input');
    checkbox.className = 'iso-checkbox';
    checkbox.id = label.htmlFor;
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', updateIsoProgress);

    addTextElement(label, 'span', 'iso-check-description', item.description);
    label.prepend(checkbox);
    addTextElement(row, 'span', 'iso-category', item.category);
    row.prepend(label);
    isoChecklist.append(row);
  });

  updateIsoProgress();
}

function formatCop(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function addBudgetField(container, lineNumber, key, labelText, type = 'number') {
  const field = document.createElement('div');
  field.className = `budget-field budget-field--${key}`;

  const id = `budget-${key}-${lineNumber}`;
  addTextElement(field, 'label', '', labelText).htmlFor = id;

  const input = document.createElement('input');
  input.id = id;
  input.dataset.budgetField = key;
  input.type = type;
  input.required = key === 'description';
  if (type === 'number') {
    input.min = '0';
    input.step = 'any';
    input.placeholder = '0';
  } else if (type === 'url') {
    input.placeholder = 'https://...';
  }
  field.append(input);
  container.append(field);
  return input;
}

function addBudgetLine() {
  budgetLineCount += 1;
  const lineNumber = budgetLineCount;
  const line = document.createElement('fieldset');
  line.className = 'budget-line';
  line.dataset.budgetLine = '';

  addTextElement(line, 'legend', 'budget-line-legend', `Partida ${lineNumber}`);

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-budget-line';
  removeButton.type = 'button';
  removeButton.setAttribute('aria-label', `Eliminar partida ${lineNumber}`);
  removeButton.textContent = 'Eliminar';
  removeButton.addEventListener('click', () => {
    line.remove();
    updateBudgetTotals();
  });
  line.append(removeButton);

  const fields = document.createElement('div');
  fields.className = 'budget-line-fields';
  addBudgetField(fields, lineNumber, 'description', 'Recurso o actividad', 'text');

  const unitField = document.createElement('div');
  unitField.className = 'budget-field budget-field--unit';
  const unitId = `budget-unit-${lineNumber}`;
  addTextElement(unitField, 'label', '', 'Unidad').htmlFor = unitId;
  const unitSelect = document.createElement('select');
  unitSelect.id = unitId;
  unitSelect.dataset.budgetField = 'unit';
  for (const unit of budgetUnits) {
    const option = document.createElement('option');
    option.value = unit;
    option.textContent = unit;
    unitSelect.append(option);
  }
  unitField.append(unitSelect);
  fields.append(unitField);

  addBudgetField(fields, lineNumber, 'quantity', 'Cantidad');
  addBudgetField(fields, lineNumber, 'unit-cost', 'Precio unitario (COP)');
  addBudgetField(fields, lineNumber, 'waste-rate', 'Desperdicio %');
  addBudgetField(fields, lineNumber, 'source', 'Fuente o proveedor', 'text');
  const sourceUrlInput = addBudgetField(fields, lineNumber, 'source-url', 'URL de la referencia', 'url');
  const sourceLink = document.createElement('a');
  sourceLink.className = 'budget-source-link';
  sourceLink.textContent = 'Abrir fuente';
  sourceLink.target = '_blank';
  sourceLink.rel = 'noopener noreferrer';
  sourceLink.hidden = true;
  sourceUrlInput.parentElement.append(sourceLink);
  sourceUrlInput.addEventListener('input', () => {
    try {
      const url = new URL(sourceUrlInput.value.trim());
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new TypeError('Protocolo no permitido');
      }
      sourceLink.href = url.href;
      sourceLink.hidden = false;
    } catch {
      sourceLink.removeAttribute('href');
      sourceLink.hidden = true;
    }
  });
  addBudgetField(fields, lineNumber, 'quote-date', 'Fecha de cotizacion', 'date');
  line.append(fields);
  budgetLines.append(line);
  updateBudgetTotals();
}

function downloadJsonFile(filename, contents) {
  const blob = new Blob([JSON.stringify(contents, null, 2)], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}

function exportBudgetTemplate() {
  downloadJsonFile('plantilla-cotizaciones-cop.json', {
    schemaVersion: 1,
    currency: 'COP',
    items: [{
      description: '',
      unit: 'Unidad',
      quantity: 0,
      unitCostCop: 0,
      wastePercent: 0,
      source: '',
      sourceUrl: '',
      quoteDate: '',
    }],
  });
}

function exportBudgetQuotes() {
  const items = Array.from(budgetLines.querySelectorAll('[data-budget-line]'), (line) => {
    const read = (field) => line.querySelector(`[data-budget-field="${field}"]`).value;
    return {
      description: read('description').trim(),
      unit: read('unit'),
      quantity: Number(read('quantity')) || 0,
      unitCostCop: Number(read('unit-cost')) || 0,
      wastePercent: Number(read('waste-rate')) || 0,
      source: read('source').trim(),
      sourceUrl: read('source-url').trim(),
      quoteDate: read('quote-date'),
    };
  }).filter((item) => item.description || item.source || item.quantity > 0 || item.unitCostCop > 0);

  downloadJsonFile(`cotizaciones-cop-${new Date().toISOString().slice(0, 10)}.json`, {
    schemaVersion: 1,
    currency: 'COP',
    items,
  });
}

function validateBudgetCatalog(catalog) {
  if (catalog?.schemaVersion !== 1 || catalog.currency !== 'COP' || !Array.isArray(catalog.items)) {
    throw new Error('El archivo debe usar schemaVersion 1, currency COP y una lista items.');
  }
  if (catalog.items.length === 0 || catalog.items.length > 100) {
    throw new Error('El archivo debe contener entre 1 y 100 partidas.');
  }

  return catalog.items.map((item, index) => {
    if (!item || typeof item.description !== 'string' || !item.description.trim() || item.description.length > 200) {
      throw new Error(`La partida ${index + 1} requiere una descripcion de hasta 200 caracteres.`);
    }
    if (!budgetUnits.includes(item.unit)) {
      throw new Error(`La unidad de la partida ${index + 1} no esta permitida.`);
    }
    for (const [field, label] of [['quantity', 'cantidad'], ['unitCostCop', 'precio unitario'], ['wastePercent', 'desperdicio']]) {
      if (typeof item[field] !== 'number' || !Number.isFinite(item[field]) || item[field] < 0) {
        throw new Error(`El campo ${label} de la partida ${index + 1} debe ser un numero igual o mayor que cero.`);
      }
    }
    if (typeof item.source !== 'string' || !item.source.trim() || typeof item.sourceUrl !== 'string' || !item.sourceUrl.trim() || typeof item.quoteDate !== 'string' || !item.quoteDate) {
      throw new Error(`La partida ${index + 1} requiere proveedor, URL y fecha de cotizacion.`);
    }
    if (item.sourceUrl) {
      let url;
      try {
        url = new URL(item.sourceUrl);
      } catch {
        throw new Error(`La URL de la partida ${index + 1} no es valida.`);
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`La URL de la partida ${index + 1} debe usar HTTP o HTTPS.`);
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.quoteDate)) {
      throw new Error(`La fecha de la partida ${index + 1} debe usar el formato AAAA-MM-DD.`);
    }
    const quoteDate = new Date(`${item.quoteDate}T00:00:00Z`);
    if (Number.isNaN(quoteDate.valueOf()) || quoteDate.toISOString().slice(0, 10) !== item.quoteDate) {
      throw new Error(`La fecha de la partida ${index + 1} no existe en el calendario.`);
    }

    return {
      description: item.description.trim(),
      unit: item.unit,
      quantity: String(item.quantity),
      'unit-cost': String(item.unitCostCop),
      'waste-rate': String(item.wastePercent),
      source: item.source.trim(),
      'source-url': item.sourceUrl.trim(),
      'quote-date': item.quoteDate,
    };
  });
}

async function importBudgetFile(file) {
  if (file.size > 1024 * 1024) {
    throw new Error('El archivo supera el limite de 1 MB.');
  }

  let catalog;
  try {
    catalog = JSON.parse(await file.text());
  } catch {
    throw new Error('El archivo no contiene JSON valido.');
  }
  const items = validateBudgetCatalog(catalog);
  const currentLines = Array.from(budgetLines.querySelectorAll('[data-budget-line]'));
  const currentLinesAreBlank = currentLines.every((line) => {
    return Array.from(line.querySelectorAll('[data-budget-field]')).every((field) => (
      field.dataset.budgetField === 'unit' || !field.value.trim()
    ));
  });
  if (currentLinesAreBlank) {
    budgetLines.replaceChildren();
    budgetLineCount = 0;
  }

  for (const item of items) {
    addBudgetLine();
    const row = budgetLines.lastElementChild;
    for (const [key, value] of Object.entries(item)) {
      const field = row.querySelector(`[data-budget-field="${key}"]`);
      field.value = value;
      if (field.type === 'url') {
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  updateBudgetTotals();
  saveDraftState();
  budgetImportStatus.hidden = false;
  budgetImportStatus.classList.remove('is-error');
  budgetImportStatus.textContent = `${items.length} partidas importadas desde JSON COP.`;
}

function updateBudgetTotals() {
  let directCost = 0;
  let wasteCost = 0;

  for (const line of budgetLines.querySelectorAll('[data-budget-line]')) {
    const fieldValue = (name) => Math.max(0, Number(line.querySelector(`[data-budget-field="${name}"]`).value) || 0);
    const lineDirectCost = fieldValue('quantity') * fieldValue('unit-cost');
    directCost += lineDirectCost;
    wasteCost += lineDirectCost * fieldValue('waste-rate') / 100;
  }

  const calculationBase = directCost + wasteCost;
  const aiuValue = (name) => {
    const rate = Math.max(0, Number(document.querySelector(`[data-aiu-rate="${name}"]`).value) || 0);
    return calculationBase * rate / 100;
  };
  const administration = aiuValue('administration');
  const contingency = aiuValue('contingency');
  const profit = aiuValue('profit');

  document.querySelector('#budget-direct-total').textContent = formatCop(directCost);
  document.querySelector('#budget-waste-total').textContent = formatCop(wasteCost);
  document.querySelector('#budget-administration-total').textContent = formatCop(administration);
  document.querySelector('#budget-contingency-total').textContent = formatCop(contingency);
  document.querySelector('#budget-profit-total').textContent = formatCop(profit);
  document.querySelector('#budget-grand-total').textContent = formatCop(calculationBase + administration + contingency + profit);
}

function renderSecopResults(references) {
  secopResults.replaceChildren();

  for (const reference of references) {
    const row = document.createElement('li');
    row.className = 'secop-result';
    const details = document.createElement('div');
    details.className = 'secop-result-details';
    addTextElement(details, 'h4', '', reference.description || 'Contrato sin descripcion');
    addTextElement(details, 'p', 'secop-entity', reference.entity);

    const date = reference.signed_at ? new Date(reference.signed_at) : null;
    const dateLabel = date && !Number.isNaN(date.valueOf())
      ? date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Fecha no disponible';
    const location = [reference.city, reference.department].filter((value) => value && value !== 'No definida' && value !== 'No definido').join(', ');
    addTextElement(details, 'p', 'secop-meta', [reference.contract_type, location || 'Territorio no definido', dateLabel, reference.contract_reference || reference.contract_id].filter(Boolean).join(' · '));
    row.append(details);

    const value = Number(reference.contract_amount_cop);
    const amount = document.createElement('div');
    amount.className = 'secop-amount';
    addTextElement(amount, 'span', '', 'Valor total del contrato');
    addTextElement(amount, 'strong', '', Number.isFinite(value) ? formatCop(value) : 'No reportado');
    row.append(amount);

    if (reference.source_url) {
      try {
        const sourceUrl = new URL(reference.source_url);
        if (sourceUrl.protocol === 'https:' && sourceUrl.hostname === 'community.secop.gov.co') {
          const link = document.createElement('a');
          link.className = 'secop-source-link';
          link.href = sourceUrl.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = 'Ver contrato';
          row.append(link);
        }
      } catch {
      }
    }
    secopResults.append(row);
  }
}

async function searchSecopContracts() {
  const query = secopQuery.value.trim();
  if (query.length < 3) {
    secopStatus.hidden = false;
    secopStatus.classList.add('is-error');
    secopStatus.textContent = 'Escribe al menos tres caracteres para buscar.';
    return;
  }

  searchSecopButton.disabled = true;
  searchSecopButton.textContent = 'Buscando...';
  secopStatus.hidden = false;
  secopStatus.classList.remove('is-error');
  secopStatus.textContent = 'Consultando SECOP II...';
  try {
    const response = await fetch('/api/v1/market/contract-references', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, department: secopDepartment.value.trim(), limit: 10 }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || `La consulta respondio con estado ${response.status}.`);
    }
    renderSecopResults(result);
    secopStatus.textContent = result.length
      ? `${result.length} referencias contractuales recibidas de SECOP II.`
      : 'SECOP II no devolvio contratos para esta busqueda.';
  } catch (error) {
    secopResults.replaceChildren();
    secopStatus.classList.add('is-error');
    secopStatus.textContent = error instanceof TypeError
      ? 'No se pudo conectar con el backend SECOP.'
      : error.message;
  } finally {
    searchSecopButton.disabled = false;
    searchSecopButton.textContent = 'Buscar en SECOP';
  }
}

function renderBudgetLines() {
  budgetLines.replaceChildren();
  budgetLineCount = 0;
  document.querySelectorAll('.aiu-rate').forEach((input) => {
    input.value = '0';
  });
  addBudgetLine();
}

function addParetoEntry() {
  paretoEntryCount += 1;
  const entryNumber = paretoEntryCount;
  const entry = document.createElement('div');
  entry.className = 'pareto-input-row';
  entry.dataset.paretoEntry = '';

  const nameField = document.createElement('div');
  nameField.className = 'budget-field pareto-name-field';
  const nameId = `pareto-name-${entryNumber}`;
  addTextElement(nameField, 'label', '', 'Causa o hallazgo').htmlFor = nameId;
  const nameInput = document.createElement('input');
  nameInput.id = nameId;
  nameInput.type = 'text';
  nameInput.dataset.paretoField = 'name';
  nameInput.placeholder = 'Ej. Retrasos en entrega';
  nameField.append(nameInput);
  entry.append(nameField);

  const countField = document.createElement('div');
  countField.className = 'budget-field pareto-count-field';
  const countId = `pareto-count-${entryNumber}`;
  addTextElement(countField, 'label', '', 'Frecuencia').htmlFor = countId;
  const countInput = document.createElement('input');
  countInput.id = countId;
  countInput.type = 'number';
  countInput.min = '0';
  countInput.step = '1';
  countInput.placeholder = '0';
  countInput.dataset.paretoField = 'frequency';
  countField.append(countInput);
  entry.append(countField);

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-budget-line';
  removeButton.type = 'button';
  removeButton.setAttribute('aria-label', `Eliminar causa ${entryNumber}`);
  removeButton.textContent = 'Eliminar';
  removeButton.addEventListener('click', () => {
    entry.remove();
    updateParetoChart();
  });
  entry.append(removeButton);
  paretoInputs.append(entry);
  updateParetoChart();
}

function renderParetoEntries() {
  paretoInputs.replaceChildren();
  paretoEntryCount = 0;
  addParetoEntry();
}

function updateParetoChart() {
  const entries = Array.from(paretoInputs.querySelectorAll('[data-pareto-entry]'))
    .map((entry) => ({
      name: entry.querySelector('[data-pareto-field="name"]').value.trim(),
      frequency: Math.max(0, Math.trunc(Number(entry.querySelector('[data-pareto-field="frequency"]').value) || 0)),
    }))
    .filter((entry) => entry.name && entry.frequency > 0)
    .sort((left, right) => right.frequency - left.frequency || left.name.localeCompare(right.name, 'es'));

  paretoResults.replaceChildren();
  const total = entries.reduce((sum, entry) => sum + entry.frequency, 0);
  paretoTotal.textContent = new Intl.NumberFormat('es-CO').format(total);

  if (total === 0) {
    paretoInsight.textContent = 'Agrega una causa con frecuencia mayor que cero para ver la priorizacion.';
    return;
  }

  let cumulative = 0;
  let thresholdIndex = -1;

  entries.forEach((entry, index) => {
    cumulative += entry.frequency;
    const cumulativePercent = cumulative / total * 100;
    if (thresholdIndex === -1 && cumulativePercent >= 80) {
      thresholdIndex = index;
    }

    const result = document.createElement('li');
    result.className = 'pareto-result';
    addTextElement(result, 'span', 'pareto-rank', String(index + 1).padStart(2, '0'));

    const detail = document.createElement('div');
    detail.className = 'pareto-detail';
    const heading = document.createElement('div');
    heading.className = 'pareto-result-heading';
    addTextElement(heading, 'strong', 'pareto-cause', entry.name);
    addTextElement(heading, 'span', 'pareto-frequency', `${entry.frequency} ocurrencias`);
    detail.append(heading);

    const barTrack = document.createElement('div');
    barTrack.className = 'pareto-bar-track';
    const bar = document.createElement('span');
    bar.className = 'pareto-bar';
    bar.style.width = `${entry.frequency / entries[0].frequency * 100}%`;
    barTrack.append(bar);
    detail.append(barTrack);
    result.append(detail);

    const cumulativeMeter = document.createElement('div');
    cumulativeMeter.className = 'pareto-cumulative';
    const progress = document.createElement('progress');
    progress.max = 100;
    progress.value = cumulativePercent;
    progress.setAttribute('aria-label', `${entry.name}: ${cumulativePercent.toFixed(1)} por ciento acumulado`);
    cumulativeMeter.append(progress);
    addTextElement(cumulativeMeter, 'span', '', `${cumulativePercent.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`);
    result.append(cumulativeMeter);
    paretoResults.append(result);
  });

  const thresholdPercent = (entries.slice(0, thresholdIndex + 1).reduce((sum, entry) => sum + entry.frequency, 0) / total * 100)
    .toLocaleString('es-CO', { maximumFractionDigits: 1 });
  paretoInsight.textContent = `Las primeras ${thresholdIndex + 1} causas concentran ${thresholdPercent}% de las ocurrencias (referencia: 80%).`;
}

function addResourceAssignment() {
  resourceAssignmentCount += 1;
  const assignmentNumber = resourceAssignmentCount;
  const assignment = document.createElement('fieldset');
  assignment.className = 'resource-assignment';
  assignment.dataset.resourceAssignment = '';
  addTextElement(assignment, 'legend', 'budget-line-legend', `Asignacion ${assignmentNumber}`);

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-budget-line';
  removeButton.type = 'button';
  removeButton.setAttribute('aria-label', `Eliminar asignacion ${assignmentNumber}`);
  removeButton.textContent = 'Eliminar';
  removeButton.addEventListener('click', () => {
    assignment.remove();
    updateResourceSummary();
  });
  assignment.append(removeButton);

  const fields = document.createElement('div');
  fields.className = 'resource-assignment-fields';
  const addTextField = (key, labelText, type = 'text') => {
    const field = document.createElement('div');
    field.className = `budget-field resource-field--${key}`;
    const id = `resource-${key}-${assignmentNumber}`;
    addTextElement(field, 'label', '', labelText).htmlFor = id;
    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.dataset.resourceField = key;
    if (type === 'number') {
      input.min = '0';
      input.step = '0.5';
      input.placeholder = '0';
    }
    field.append(input);
    fields.append(field);
  };

  addTextField('person', 'Responsable o recurso');
  addTextField('role', 'Rol o especialidad');

  const phaseField = document.createElement('div');
  phaseField.className = 'budget-field resource-field--phase';
  const phaseId = `resource-phase-${assignmentNumber}`;
  addTextElement(phaseField, 'label', '', 'Fase PHVA').htmlFor = phaseId;
  const phaseSelect = document.createElement('select');
  phaseSelect.id = phaseId;
  phaseSelect.dataset.resourceField = 'phase';
  for (const phase of phaseTemplates) {
    const option = document.createElement('option');
    option.value = phase.name;
    option.textContent = phase.name;
    phaseSelect.append(option);
  }
  phaseField.append(phaseSelect);
  fields.append(phaseField);

  addTextField('hours', 'Horas estimadas', 'number');
  assignment.append(fields);
  resourceAssignments.append(assignment);
  updateResourceSummary();
}

function renderResourceAssignments() {
  resourceAssignments.replaceChildren();
  resourceAssignmentCount = 0;
  addResourceAssignment();
}

function updateResourceSummary() {
  const hoursByPhase = Object.fromEntries(phaseTemplates.map((phase) => [phase.name, 0]));
  let assignmentCount = 0;

  for (const assignment of resourceAssignments.querySelectorAll('[data-resource-assignment]')) {
    const person = assignment.querySelector('[data-resource-field="person"]').value.trim();
    const role = assignment.querySelector('[data-resource-field="role"]').value.trim();
    if (!person && !role) {
      continue;
    }

    assignmentCount += 1;
    const phase = assignment.querySelector('[data-resource-field="phase"]').value;
    const hours = Math.max(0, Number(assignment.querySelector('[data-resource-field="hours"]').value) || 0);
    hoursByPhase[phase] += hours;
  }

  resourceSummary.replaceChildren();
  const totalHours = Object.values(hoursByPhase).reduce((sum, hours) => sum + hours, 0);
  const summaryItems = [
    { label: 'Asignaciones', value: new Intl.NumberFormat('es-CO').format(assignmentCount) },
    { label: 'Horas estimadas', value: `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(totalHours)} h` },
    ...phaseTemplates.map((phase) => ({
      label: phase.name,
      value: `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(hoursByPhase[phase.name])} h`,
    })),
  ];

  for (const item of summaryItems) {
    const row = document.createElement('div');
    addTextElement(row, 'dt', '', item.label);
    addTextElement(row, 'dd', '', item.value);
    resourceSummary.append(row);
  }
}

function serializeRows(container, rowSelector, fieldSelector, datasetKey) {
  return Array.from(container.querySelectorAll(rowSelector), (row) => {
    return Object.fromEntries(Array.from(row.querySelectorAll(fieldSelector), (field) => [
      field.dataset[datasetKey],
      field.value,
    ]));
  });
}

function restoreRows(container, records, addRow, rowSelector, fieldSelector, datasetKey) {
  if (!Array.isArray(records)) {
    return;
  }

  let rows = Array.from(container.querySelectorAll(rowSelector));
  while (rows.length < records.length) {
    addRow();
    rows = Array.from(container.querySelectorAll(rowSelector));
  }
  while (rows.length > records.length) {
    rows.pop().remove();
  }

  rows.forEach((row, index) => {
    for (const field of row.querySelectorAll(fieldSelector)) {
      const value = records[index][field.dataset[datasetKey]];
      if (value !== undefined) {
        field.value = value;
        if (field.type === 'url') {
          field.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  });
}

function saveDraftState() {
  if (restoringDraft || planResult.hidden) {
    return;
  }
  if (!projectForm.checkValidity()) {
    draftStatus.textContent = 'Completa los campos requeridos para guardar';
    return;
  }

  const state = {
    version: 1,
    currentProjectId,
    form: Object.fromEntries(new FormData(projectForm)),
    isoChecklist: Array.from(isoChecklist.querySelectorAll('input[type="checkbox"]'), (input) => input.checked),
    budgetLines: serializeRows(budgetLines, '[data-budget-line]', '[data-budget-field]', 'budgetField'),
    aiuRates: Object.fromEntries(Array.from(document.querySelectorAll('.aiu-rate'), (input) => [input.dataset.aiuRate, input.value])),
    paretoEntries: serializeRows(paretoInputs, '[data-pareto-entry]', '[data-pareto-field]', 'paretoField'),
    resourceAssignments: serializeRows(resourceAssignments, '[data-resource-assignment]', '[data-resource-field]', 'resourceField'),
    legalStatuses: Array.from(legalChecklist.querySelectorAll('.legal-status'), (select) => select.value),
    generatedPlan: currentGeneratedPlan,
  };

  try {
    window.localStorage.setItem(localDraftKey, JSON.stringify(state));
    if (currentProjectId) {
      upsertProjectRecord(state);
    }
    draftStatus.textContent = currentGeneratedPlan?.mode === 'ai'
      ? 'Borrador IA guardado en este navegador'
      : 'Borrador guardado en este navegador';
  } catch {
    draftStatus.textContent = 'No se pudo guardar el borrador localmente';
  }
}

function restoreDraftState(savedState = null) {
  let state = savedState;
  if (!state) {
    try {
      const savedDraft = window.localStorage.getItem(localDraftKey);
      if (!savedDraft) {
        return;
      }
      state = JSON.parse(savedDraft);
    } catch {
      draftStatus.textContent = 'No se pudo leer el borrador local';
      return;
    }
  }

  if (!state || typeof state !== 'object' || state.version !== 1 || !state.form || typeof state.form !== 'object') {
    return;
  }

  restoringDraft = true;
  try {
    currentProjectId = state.currentProjectId || null;
    updateSaveProjectButton();
    for (const [name, value] of Object.entries(state.form)) {
      const field = projectForm.elements.namedItem(name);
      if (field) {
        field.value = value;
      }
    }

    if (!projectForm.checkValidity()) {
      return;
    }
    projectForm.requestSubmit();
    if (planResult.hidden) {
      return;
    }
    if (isValidGeneratedPlan(state.generatedPlan)) {
      renderGeneratedPlan(state.generatedPlan);
    }

    restoreRows(budgetLines, state.budgetLines, addBudgetLine, '[data-budget-line]', '[data-budget-field]', 'budgetField');
    for (const [name, value] of Object.entries(state.aiuRates || {})) {
      const field = document.querySelector(`[data-aiu-rate="${name}"]`);
      if (field) {
        field.value = value;
      }
    }
    updateBudgetTotals();

    restoreRows(paretoInputs, state.paretoEntries, addParetoEntry, '[data-pareto-entry]', '[data-pareto-field]', 'paretoField');
    updateParetoChart();

    restoreRows(resourceAssignments, state.resourceAssignments, addResourceAssignment, '[data-resource-assignment]', '[data-resource-field]', 'resourceField');
    updateResourceSummary();

    isoChecklist.querySelectorAll('input[type="checkbox"]').forEach((input, index) => {
      input.checked = Boolean(state.isoChecklist?.[index]);
    });
    updateIsoProgress();

    legalChecklist.querySelectorAll('.legal-status').forEach((select, index) => {
      select.value = state.legalStatuses?.[index] || 'pending';
    });
    updateLegalProgress();

    draftStatus.textContent = 'Borrador restaurado de este navegador';
    window.scrollTo(0, 0);
  } catch {
    draftStatus.textContent = 'No se pudo restaurar el borrador local';
  } finally {
    restoringDraft = false;
  }
}

function getSavedProjects() {
  try {
    const projects = JSON.parse(window.localStorage.getItem(localProjectsKey) || '[]');
    return Array.isArray(projects) ? projects : [];
  } catch {
    return [];
  }
}

function upsertProjectRecord(draft) {
  const formData = new FormData(projectForm);
  const sectorField = projectForm.elements.namedItem('project-sector');
  const project = {
    id: currentProjectId,
    name: formData.get('project-name').trim(),
    sector: sectorField.options[sectorField.selectedIndex].text,
    updatedAt: new Date().toISOString(),
    draft,
  };
  const projects = getSavedProjects().filter((savedProject) => savedProject.id !== currentProjectId);
  projects.unshift(project);
  window.localStorage.setItem(localProjectsKey, JSON.stringify(projects));
  if (!projectLibrary.hidden) {
    renderProjectLibrary();
  }
}

function updateSaveProjectButton() {
  saveProjectButton.textContent = currentProjectId ? 'Actualizar proyecto' : 'Guardar proyecto';
}

function saveProjectToLibrary() {
  if (planResult.hidden || !projectForm.checkValidity()) {
    return;
  }
  if (!currentProjectId) {
    currentProjectId = globalThis.crypto?.randomUUID?.() || `project-${Date.now()}`;
  }
  updateSaveProjectButton();
  saveDraftState();
  draftStatus.textContent = 'Proyecto guardado en este navegador';
  renderProjectLibrary();
}

function renderProjectLibrary() {
  const projects = getSavedProjects().filter((project) => project && project.id && project.draft);
  projectLibraryList.replaceChildren();
  projectLibraryCount.textContent = `${projects.length} ${projects.length === 1 ? 'proyecto guardado' : 'proyectos guardados'}`;
  projectLibraryEmpty.hidden = projects.length > 0;

  for (const project of projects) {
    const row = document.createElement('li');
    row.className = 'project-library-item';
    const details = document.createElement('div');
    addTextElement(details, 'h3', '', project.name || 'Proyecto sin nombre');
    const updatedAt = new Date(project.updatedAt);
    const updatedText = Number.isNaN(updatedAt.valueOf())
      ? 'Fecha no disponible'
      : `Actualizado ${updatedAt.toLocaleString('es-CO')}`;
    addTextElement(details, 'p', '', `${project.sector || 'Sector sin definir'} · ${updatedText}`);
    row.append(details);

    const actions = document.createElement('div');
    actions.className = 'project-library-actions';
    const openButton = document.createElement('button');
    openButton.className = 'secondary-button';
    openButton.type = 'button';
    openButton.textContent = 'Abrir';
    openButton.addEventListener('click', () => openSavedProject(project.id));
    actions.append(openButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'project-library-delete';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Eliminar';
    deleteButton.setAttribute('aria-label', `Eliminar ${project.name || 'proyecto'}`);
    deleteButton.addEventListener('click', () => deleteSavedProject(project.id));
    actions.append(deleteButton);
    row.append(actions);
    projectLibraryList.append(row);
  }
}

function setActiveNavigation(activeLink) {
  for (const link of [newPlanNavigation, myProjectsNavigation]) {
    const isActive = link === activeLink;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

function showProjectLibrary() {
  saveDraftState();
  pageHeading.hidden = true;
  newProjectWorkspace.hidden = true;
  planResult.hidden = true;
  projectLibrary.hidden = false;
  renderProjectLibrary();
  setActiveNavigation(myProjectsNavigation);
  window.history.replaceState(null, '', '#planes');
}

function showNewPlanView() {
  projectLibrary.hidden = true;
  pageHeading.hidden = false;
  newProjectWorkspace.hidden = false;
  planResult.hidden = !currentGeneratedPlan;
  setActiveNavigation(newPlanNavigation);
  window.history.replaceState(null, '', '#nuevo-plan');
}

function openSavedProject(projectId) {
  const project = getSavedProjects().find((savedProject) => savedProject.id === projectId);
  if (!project) {
    return;
  }
  restoreDraftState(project.draft);
  if (planResult.hidden) {
    return;
  }
  showNewPlanView();
  draftStatus.textContent = `Proyecto abierto: ${project.name}`;
}

function deleteSavedProject(projectId) {
  const project = getSavedProjects().find((savedProject) => savedProject.id === projectId);
  if (!project || !window.confirm(`Eliminar el proyecto "${project.name}" de este navegador?`)) {
    return;
  }

  const projects = getSavedProjects().filter((savedProject) => savedProject.id !== projectId);
  window.localStorage.setItem(localProjectsKey, JSON.stringify(projects));
  if (currentProjectId === projectId) {
    currentProjectId = null;
    window.localStorage.removeItem(localDraftKey);
    updateSaveProjectButton();
  }
  renderProjectLibrary();
}

function startNewProject() {
  const hasUnsavedDraft = !currentProjectId && Boolean(window.localStorage.getItem(localDraftKey));
  if (hasUnsavedDraft && !window.confirm('Descartar el borrador sin guardar y empezar otro?')) {
    return;
  }
  currentProjectId = null;
  currentGeneratedPlan = null;
  window.localStorage.removeItem(localDraftKey);
  projectForm.reset();
  planResult.hidden = true;
  aiFeedback.hidden = true;
  draftStatus.textContent = 'Borrador sin guardar';
  updateSaveProjectButton();
  showNewPlanView();
}

addBudgetLineButton.addEventListener('click', addBudgetLine);
importBudgetQuotesButton.addEventListener('click', () => budgetImportFile.click());
exportBudgetTemplateButton.addEventListener('click', exportBudgetTemplate);
exportBudgetQuotesButton.addEventListener('click', exportBudgetQuotes);
budgetImportFile.addEventListener('change', async () => {
  const [file] = budgetImportFile.files;
  if (!file) {
    return;
  }
  try {
    await importBudgetFile(file);
  } catch (error) {
    budgetImportStatus.hidden = false;
    budgetImportStatus.classList.add('is-error');
    budgetImportStatus.textContent = error.message;
  } finally {
    budgetImportFile.value = '';
  }
});
searchSecopButton.addEventListener('click', searchSecopContracts);
budgetLines.addEventListener('input', updateBudgetTotals);
budgetLines.addEventListener('change', updateBudgetTotals);
document.querySelectorAll('.aiu-rate').forEach((input) => {
  input.addEventListener('input', updateBudgetTotals);
});
addParetoEntryButton.addEventListener('click', addParetoEntry);
paretoInputs.addEventListener('input', updateParetoChart);
addResourceAssignmentButton.addEventListener('click', addResourceAssignment);
resourceAssignments.addEventListener('input', updateResourceSummary);
resourceAssignments.addEventListener('change', updateResourceSummary);
legalChecklist.addEventListener('change', updateLegalProgress);
document.addEventListener('input', saveDraftState);
document.addEventListener('change', saveDraftState);
document.addEventListener('click', saveDraftState);
generateAiPlanButton.addEventListener('click', generatePlanWithAI);
printPlanButton.addEventListener('click', () => window.print());
saveProjectButton.addEventListener('click', saveProjectToLibrary);
newPlanNavigation.addEventListener('click', (event) => {
  event.preventDefault();
  startNewProject();
});
myProjectsNavigation.addEventListener('click', (event) => {
  event.preventDefault();
  showProjectLibrary();
});
newProjectFromLibraryButton.addEventListener('click', startNewProject);

function syncViewWithLocationHash() {
  if (window.location.hash === '#planes') {
    showProjectLibrary();
  } else if (window.location.hash === '#nuevo-plan' && !projectLibrary.hidden) {
    showNewPlanView();
  }
}

projectForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(projectForm);
  const projectName = formData.get('project-name').trim();
  const sectorField = projectForm.elements.namedItem('project-sector');
  const sector = sectorField.options[sectorField.selectedIndex].text;
  const location = formData.get('project-location').trim();
  const budgetValue = formData.get('project-budget');
  const durationValue = formData.get('project-duration');
  const objective = formData.get('project-objective').trim();
  const budget = budgetValue
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(budgetValue))
    : 'Por definir';

  planTitle.textContent = projectName;
  const overview = objective || 'Objetivo y alcance pendientes de definir.';
  projectFacts.replaceChildren();
  addFact('Sector', sector);
  addFact('Ubicación', location);
  addFact('Presupuesto', budget);
  addFact('Duración', durationValue ? `${durationValue} semanas` : 'Por definir');

  renderGeneratedPlan(createTemplatePlan(overview));
  aiFeedback.hidden = true;
  aiFeedback.classList.remove('is-error');
  renderIsoChecklist();
  renderBudgetLines();
  renderParetoEntries();
  renderResourceAssignments();
  renderLegalChecklist();

  planResult.hidden = false;
  draftStatus.textContent = 'Estructura generada en esta sesión';
  saveDraftState();
  planResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

restoreDraftState();
window.addEventListener('DOMContentLoaded', syncViewWithLocationHash, { once: true });
window.addEventListener('hashchange', syncViewWithLocationHash);