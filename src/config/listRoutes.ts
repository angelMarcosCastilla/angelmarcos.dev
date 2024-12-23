interface IRoute {
  path: string
  name: string
}

export const routes: IRoute[] = [
  {
    path: '/',
    name: 'Inicio'
  },
  {
    path: '/blog',
    name: 'Blog'
  }, 
 /*  {
    path: '/contact',
    name: 'Contact'
  } */
]
