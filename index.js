const fs = require('fs')
const _ = require('lodash')
const utils = require('./utils')

const generateSteps = generatorConfig => {
  const actions = require(generatorConfig.actionsPath)
  const targets = require(generatorConfig.targetsPath)
  const areas = require(generatorConfig.areasPath)
  const injections = _.get(generatorConfig, 'outputFile.injections', {})

  const header = `/* eslint-disable */
import { client } from 'nightwatch-api'
import { Then } from 'cucumber'

const context = {
  client,
  xpath: require('${generatorConfig.configPath}').xpath,
  variables: require('${generatorConfig.configPath}').variables,
  utils: require('cucumber-steps-generator'),
  injections: { ${_.map(injections, (path, name) => `${name}: require('${path}')`).join(', ')} }
}\n`

  const targetPlaceholder = '{target}'
  const placeholdersRegex = /{string}|{number}|{integer}/g

  const placeholdersAmount = gherkin => (gherkin.match(placeholdersRegex) || []).length

  const parsePlaceholders = (str = '') => str.replace(placeholdersRegex, '"([^"]+)"')

  const generateStep = ({ action, target, area }) => {
    let argIndex = 0
    const getArgs = gherkin => {
      if (!gherkin) {
        return []
      }

      return _.times(placeholdersAmount(gherkin), () => `arg${++argIndex}`)
    }

    const actionGherkinParts = _.split(action.gherkin, targetPlaceholder, 2)
    const actionGherkinBeforeTargetPart = actionGherkinParts[0]
    const actionGherkinAfterTargetPart = actionGherkinParts[1]

    const actionWithArgs = _.assign({ args: getArgs(actionGherkinBeforeTargetPart) }, action)
    const targetWithArgs = target ? [_.assign({ args: getArgs(target.gherkin) }, target)] : []
    actionWithArgs.args = _.concat(actionWithArgs.args, getArgs(actionGherkinAfterTargetPart))
    const areaWithArgs = area ? [_.assign({ args: getArgs(area.gherkin) }, area)] : []

    const regex = parsePlaceholders(actionGherkinBeforeTargetPart)
      + parsePlaceholders(target ? target.gherkin : '')
      + parsePlaceholders(actionGherkinAfterTargetPart)
      + parsePlaceholders(area ? ' ' + area.gherkin : '')

    const sortedArgs = _.sortBy(_.flatten(_.map([actionWithArgs, ...targetWithArgs, ...areaWithArgs], 'args')), arg => parseInt(_.replace(arg, 'arg', ''), 10))
    const pathParts = _.reverse([...targetWithArgs, ...areaWithArgs])
    const actionArgs = _.concat(['context'], actionWithArgs.args, pathParts.length ? ['path'] : [])
    const pathCode = _.map(pathParts, part => {
      const pathArgs = _.concat(['context'], part.args)
      return `(${part.func.toString()})(${pathArgs.join(', ')})`
    }).join(' + ')

    const actionName = _.findKey(actions, a => a === action)
    const targetName = _.findKey(targets, t => t === target)
    const areaName = _.findKey(areas, a => a === area)
    const comment = `// action ${actionName}${targetName ? ' on target ' + targetName : ''}${areaName ? ' in area ' + areaName : ''}`

    return (
      `${comment}\nThen(/^${regex}$/, (${sortedArgs.join(', ')}) => {\n` +
      (pathCode ? `  const path = ${pathCode}\n` : '') +
      `  return (${action.func.toString()})(${actionArgs.join(', ')})\n})\n`
    )
  }

  const body = _.map(actions, action => {
    const hasGherkinTarget = _.includes(action.gherkin, targetPlaceholder)
    const actionTargets = hasGherkinTarget ? action.targets || _.keys(targets) : []

    if (actionTargets.length === 0) {
      return generateStep({ action })
    }

    return _.map(actionTargets, targetName => {
      const actionTarget = targets[targetName]
      const actionTargetAreas = actionTarget.areas || _.keys(areas)

      if (!actionTarget) {
        throw new Error(`Cannot find target ${targetName}`)
      }

      const actionWithTargetStep = generateStep({ action, target: actionTarget })

      const actionWithTargetAndAreaSteps = _.map(actionTargetAreas, areaName => {
        const actionTargetArea = areas[areaName]

        if (!actionTargetArea) {
          throw new Error(`Cannot find area ${areaName}`)
        }

        return generateStep({ action, target: actionTarget, area: actionTargetArea })
      }).join('')

      return actionWithTargetStep + actionWithTargetAndAreaSteps
    }).join('')
  }).join('')

  fs.writeFile(generatorConfig.outputFile.path, `${header}${body}`, err => {
    if (err) {
      console.error(err)
    }
    console.log('\x1B[33m%s\x1B[0m', `CONGRATS! Cucumber steps were generated into ${generatorConfig.outputFile.path}`)
  })
}

module.exports = Object.assign(utils, { generateSteps })
