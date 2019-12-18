const _ = require('lodash')
const illegalFilenameCharactersRegExp = /[\<\>\:\"\/\\\|\?\*]/g

module.exports.helpers = {
  extendXpath: xpath => {
    const rules = [
      {
        match: /has-class\(['"]([^'"]+)['"]\)/g,
        replace: 'contains(concat(" ", normalize-space(@class), " "), " $1 ")'
      },
      {
        match: /text\(\)/g,
        replace: 'normalize-space(text())'
      }
    ]
    return _.reduce(rules, (result, rule) => _.replace(result, rule.match, rule.replace), xpath)
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
