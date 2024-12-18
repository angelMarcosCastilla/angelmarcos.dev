export interface ProyectI {
  image: string
  title: string
  description: string
  tecnologias: string
  demoLink: string
  repoLink: string
}

export const proyects: ProyectI[] = [
  {
    image: 'https://i.imgur.com/K1SEZ5T.png',
    title: 'Toast js',
    description:
      'Una biblioteca ligera en VanillaJS para mostrar notificaciones rápidas y elegantes en tu aplicación web. La biblioteca permite agregar notificaciones personalizables con diferentes estilos (éxito, error, advertencia, información) que desaparecen automáticamente después de un tiempo definido o que pueden ser cerradas manualmente.',
    demoLink: 'https://toast-js-orcin.vercel.app/',
    repoLink: 'https://github.com/angelMarcosCastilla/toast-js',
    tecnologias: ''
  },
  {
    image: 'https://i.imgur.com/xLXdSLf.png',
    title: 'Sistema de admisión',
    description:
      'Este proyecto representa una iniciativa innovadora desarrollada como parte del término de la carrera de Ingeniería de Software. Se centra en la creación de un sistema integral de admisión en línea y gestión de informes médicos diseñado específicamente para optimizar los procesos en el prestigioso Centro Médico Melchorita Saravia.',
    tecnologias: 'React, Tailwind css, nodejs, express, NextUI',
    demoLink: 'https://centro-medico-frontend.vercel.app/',
    repoLink: 'https://github.com/angelMarcosCastilla/centro-medico-frontend'
  },
  {
    image: 'https://i.imgur.com/qG7prmF.png',
    title: 'Acortador de url',
    description: 'Este proyecto consiste en generar url corta de manera mas sencilla',
    tecnologias: 'React, Tailwind css, Nexjs, redis',
    demoLink: 'https://s-url-five.vercel.app/',
    repoLink: 'https://github.com/angelMarcosCastilla/s-url'
  }
]
