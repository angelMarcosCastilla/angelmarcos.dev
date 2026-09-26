interface IExperiencia {
  time: string
  role: string
  company: string
  description: string
}

export const EXPERIENCIES: IExperiencia[] = [
  {
    time: 'Marzo 2022 - Actualmemnte',
    role: 'Junior Frontend developer',
    company: 'Latamready',
    description:
      'Formo parte del equipo que desarrolla herramientas internas para la empresa como un administrador de proyecto para dar seguimiento a las tareas de los desarrollos, usando React para la parte de frontend.'
  }
]
export const EXPERIENCIES_NETSUITE: IExperiencia[] = [
  {
    time: 'Junio 2026 - Actualmente',
    role: 'Desarrollador NetSuite',
    company: 'Tekiio',
    description:
      'Desarrollo personalizaciones y soluciones a medida sobre NetSuite utilizando SuiteScript, participando en la implementación y mejora de funcionalidades orientadas a las necesidades del negocio. Trabajo en el desarrollo de scripts, automatizaciones, reportes y diferentes componentes de NetSuite, buscando optimizar procesos y reducir tareas manuales.'
  },
  {
    time: 'Marzo 2022 - Mayo 2026',
    role: 'SuiteCloud Developer',
    company: 'LatamReady',
    description:
      'Inicié desarrollando herramientas internas con React y posteriormente me especialicé en el desarrollo de soluciones sobre NetSuite utilizando SuiteScript. Participé en proyectos de personalización, automatización e integración, desarrollando módulos de inscripción a cursos, integraciones y flujos de aprobación. También trabajé en reportes personalizados, generación y personalización de PDFs, búsquedas guardadas y otras funcionalidades adaptadas a los procesos del negocio.'
  }
]
