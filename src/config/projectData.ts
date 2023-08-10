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
      'https://res.cloudinary.com/dggsqddcf/image/upload/v1654790050/portafolio/n8whff8varfqm6ubdsuv.png',
    title: 'Pokememory',
    description:
      'Juego de memoria de pokemon, el juego consiste en encontrar las parejas de pokemon',
    tecnologias: "Html, css, JavasSript",
    demoLink: 'https://pokememory.vercel.app/',
    repoLink: 'jola'
  }
]
