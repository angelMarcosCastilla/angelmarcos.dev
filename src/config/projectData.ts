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
    image:
      'https://i.imgur.com/QiD7AWK.png',
    title: 'Country App',
    description:
      'Una aplicación que muestra todos los países del mundo y su detalle esta es basada en unos de los retos  de Frontend Mentor, esta aplicación consume la API restcountries para poder mostrar los datos de los países',
    tecnologias: "React, Next js, Tailwind css",
    demoLink: 'https://country-next-app.vercel.app/',
    repoLink: 'https://github.com/angelMarcosCastilla/country-next-app'
  },
  {
    image:
      'https://i.imgur.com/xLXdSLf.png',
    title: 'Sistema de admisión',
    description:
      'Este proyecto representa una iniciativa innovadora desarrollada como parte del término de la carrera de Ingeniería de Software. Se centra en la creación de un sistema integral de admisión en línea y gestión de informes médicos diseñado específicamente para optimizar los procesos en el prestigioso Centro Médico Melchorita Saravia.',
    tecnologias: "React, Tailwind css, nodejs, express, NextUI",
    demoLink: 'https://centro-medico-frontend.vercel.app/',
    repoLink: 'https://github.com/angelMarcosCastilla/centro-medico-frontend'
  }
]
