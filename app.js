const projectForm = document.querySelector('.project-form');
const planResult = document.querySelector('#plan-result');
const planTitle = document.querySelector('#generated-plan-title');
const planObjective = document.querySelector('#generated-objective');
const projectFacts = document.querySelector('#project-facts');
const generatedPhases = document.querySelector('#generated-phases');
const draftStatus = document.querySelector('#draft-status');

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

  planResult.hidden = false;
  draftStatus.textContent = 'Estructura generada en esta sesión';
  planResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
});