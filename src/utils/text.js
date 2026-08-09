/**
 * Strips diacritics and lowercases, so searching "gdansk" finds "Gdańsk".
 *
 * Nobody types Polish diacritics on a phone keyboard, and without this the
 * stop search returns nothing for most of the queries people actually use.
 */
export const fold = (value) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    // NFD does not touch ł: it is its own Unicode letter (U+0142), not l plus
    // a combining mark, so "glowny" would still miss "Główny" without this.
    .replace(/ł/g, 'l')
