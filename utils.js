const illegalFilenameCharactersRegExp = /[\<\>\:\"\/\\\|\?\*\s]/g
const funcRegEx = name => new RegExp(`${name}\\(\\"([^\\"]+)\\"\\)`, 'g')
const xpathFunctions = [
  {
    name: 'has-class',
    replace: 'contains(concat(" ", normalize-space(@class), " "), " $1 ")',
    format: /contains\(concat\(\"\s\",\snormalize-space\(\@class\),\s\"\s\"\),/g
  },
  {
    name: 'has-text',
    replace: 'contains(text(), "$1")',
    format: /contains\(text\(\),/g
  },
  {
    name: 'text-is',
    replace: 'normalize-space(text())="$1"',
    format: /normalize-space\(text\(\)\)/g
  }
]

module.exports = {
  extendXpath: xpath =>
    xpathFunctions.reduce((result, rule) => result.replace(funcRegEx(rule.name), rule.replace), xpath),
  xpathToFileName: xpath =>
    xpathFunctions.reduce((result, rule) => result.replace(rule.format, `${rule.name}`), xpath)
      .replace(/(\sand\s)/g, '_and_')
      .replace(/(\sor\s)/g, '_or_')
      .replace(/\"\)/g, '')
      .replace(/\(\"|=\"|\s\"/g, '_')
      .replace(illegalFilenameCharactersRegExp, ''),
  lastElement: xpath => `(${xpath})[last()]`,
  elementAtPosition: (xpath, number) => `(${xpath})[${number}]`,
  illegalFilenameCharactersRegExp,
  funcRegEx
}
