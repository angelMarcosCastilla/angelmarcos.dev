---
description: Aprende como ordenar de forma aleatoria los valores de un array
title: Ordenar de forma aleatoria los elementos de un array
date: 19 de diciembre, 2023
author: Angel Marcos
minutes: 3
image:
  src: /assets/img/blog/1.jpg
  alt: Mi primer blog
tags: []
---

Cuando trabajamos con arrays en JavaScript, a menudo surge la necesidad de ordenar sus elementos. Sin embargo, en ocasiones queremos mezclar los elementos de forma aleatoria en lugar de seguir un orden ascendente o descendente. En este artículo, exploraremos cómo lograr esto de manera sencilla y eficiente.

## Método de Mezcla Aleatoria con el Algoritmo de Fisher-Yates

Una de las técnicas más comunes y efectivas para ordenar aleatoriamente un array es el algoritmo de Fisher-Yates, también conocido como el algoritmo de mezcla o shuffle. Este algoritmo es eficiente y garantiza una distribución uniforme de elementos aleatorios.

```javascript
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
// Ejemplo de uso
const numeros = [1, 2, 3, 4, 5]
shuffleArray(numeros)
console.log(numeros)
```

## Usando el metodo sort

El método `sort` es una función integrada en JavaScript que se utiliza para ordenar los elementos de un array. Por defecto, sort ordena los elementos alfabéticamente (si se trata de cadenas) o numéricamente. Sin embargo, podemos personalizar la función de comparación para lograr un ordenamiento aleatorio.

```javascript
function ordenarAleatoriamente(array) {
  return array.sort(() => Math.random() - 0.5)
}
```
