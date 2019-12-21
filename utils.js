const illegalFilenameCharactersRegExp = /[\<\>\:\"\/\\\|\?\*\s]/g
const funcRegEx = name => new RegExp(`${name}\\(\\"([^\\"]+)\\"\\)`, 'g')
const xpathFunctions = [
  {
    name: 'has-class',
    replace: 'contains(concat(" ", normalize-space(@class), " "), " $1 ")',
    format: xpath => xpath.replace(/contains\(concat\(\"\s\",\snormalize-space\(\@class\),\s\"\s\"\),/g, 'with_class_')
  },
  {
    name: 'has-text',
    replace: 'contains(normalize-space(text()), "$1")',
    format: xpath => xpath.replace(/contains\(normalize-space\(text\(\)\),/g, 'with_text_')
  },
  {
    name: 'text-is',
    replace: 'normalize-space(text())="$1"',
    format: xpath => xpath.replace(/normalize-space\(text\(\)\)=/g, 'with_text_')
  }
]

module.exports = {
  extendXpath: xpath =>
    xpathFunctions.reduce((result, rule) => result.replace(funcRegEx(rule.name), rule.replace), xpath),
  xpathToFileName: xpath =>
    xpathFunctions.reduce((result, rule) => rule.format(result), xpath)
      .replace(/\s(and|or)\s/g, '_$1_')
      .replace(/\*\[/g, 'el[')
      .replace(/\@/g, 'with_')
      .replace(/[\[\=]/g, '_')
      .replace(/[\]\)\(]/g, '')
      .replace(illegalFilenameCharactersRegExp, '')
      .toLowerCase(),
  lastElement: xpath => `(${xpath})[last()]`,
  elementAtPosition: (xpath, number) => `(${xpath})[${number}]`,
  illegalFilenameCharactersRegExp,
  funcRegEx
}
