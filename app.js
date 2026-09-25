const projectForm = document.querySelector('.project-form');
const planResult = document.querySelector('#plan-result');
const planTitle = document.querySelector('#generated-plan-title');
const planObjective = document.querySelector('#generated-objective');
const projectFacts = document.querySelector('#project-facts');
const generatedPhases = document.querySelector('#generated-phases');
const draftStatus = document.querySelector('#draft-status');
const isoChecklist = document.querySelector('#iso-checklist');
const isoProgress = document.querySelector('#iso-progress');
const isoProgressBar = document.querySelector('#iso-progress-bar');
const budgetLines = document.querySelector('#budget-lines');
const addBudgetLineButton = document.querySelector('#add-budget-line');
let budgetLineCount = 0;

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

  const activities = document.createElement('ol');
  for (const activity of phase.activities) {
    addTextElement(activities, 'li', '', activity);
  }
  article.append(activities);
  generatedPhases.append(article);
}

function updateIsoProgress() {
  const completedItems = isoChecklist.querySelectorAll('input[type="checkbox"]:checked').length;
  isoProgress.textContent = `${completedItems} de ${isoChecklistItems.length} completados`;
  isoProgressBar.value = completedItems;
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
  for (const unit of ['Unidad', 'Hora', 'Jornada', 'm', 'm2', 'm3', 'kg', 'Litro', 'Servicio']) {
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

function renderBudgetLines() {
  budgetLines.replaceChildren();
  budgetLineCount = 0;
  document.querySelectorAll('.aiu-rate').forEach((input) => {
    input.value = '0';
  });
  addBudgetLine();
}

addBudgetLineButton.addEventListener('click', addBudgetLine);
budgetLines.addEventListener('input', updateBudgetTotals);
budgetLines.addEventListener('change', updateBudgetTotals);
document.querySelectorAll('.aiu-rate').forEach((input) => {
  input.addEventListener('input', updateBudgetTotals);
});

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
  planObjective.textContent = objective || 'Objetivo y alcance pendientes de definir.';
  projectFacts.replaceChildren();
  addFact('Sector', sector);
  addFact('Ubicación', location);
  addFact('Presupuesto', budget);
  addFact('Duración', durationValue ? `${durationValue} semanas` : 'Por definir');

  generatedPhases.replaceChildren();
  for (const phase of phaseTemplates) {
    renderPhase(phase);
  }
  renderIsoChecklist();
  renderBudgetLines();

  planResult.hidden = false;
  draftStatus.textContent = 'Estructura generada en esta sesión';
  planResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
});