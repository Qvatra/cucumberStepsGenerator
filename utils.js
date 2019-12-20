const illegalFilenameCharactersRegExp = /[\<\>\:\"\/\\\|\?\*]/g

module.exports = {
  extendXpath: xpath => {
    const funcWithStringArgRegEx = name => new RegExp(`${name}\\(['"]([^'"]+)['"]\\)`, 'g')
    const rules = [
      {
        match: funcWithStringArgRegEx('has-class'),
        replace: 'contains(concat(" ", normalize-space(@class), " "), " $1 ")'
      },
      {
        match: funcWithStringArgRegEx('has-text'),
        replace: 'contains(text(), "$1")'
      },
      {
        match: funcWithStringArgRegEx('text-is'),
        replace: 'normalize-space(text())="$1")'
      }
    ]
    return rules.reduce((result, rule) => result.replace(rule.match, rule.replace), xpath)
  },
  xpathToFileName: xpath =>
    xpath
      .replace(/(\sand\s)/g, '_and_')
      .replace(/[\s"'()[\],@]|(\/\/)/g, '')
      .replace(/(containsconcatnormalize-spaceclass)/g, '_with_class_')
      .replace(/(normalize-spacetext)/g, '_text')
      .replace(/=|(__)|\//g, '_')
      .replace(illegalFilenameCharactersRegExp, '_'),
  lastElement: xpath => `(${xpath})[last()]`,
  elementAtPosition: (xpath, number) => `(${xpath})[${number}]`,
  illegalFilenameCharactersRegExp
}
