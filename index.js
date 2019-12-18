const fs = require('fs')
const _ = require('lodash')
const { helpers } = require('./helpers')

module.exports.helpers = helpers

module.exports = config => {
  const { actions, targets, areas, paths } = config

  const header = `/* eslint-disable */
import { client } from 'nightwatch-api'
import { Then, Before } from 'cucumber'
import { xpath, variables } from '${paths.config}'
import { helpers } from 'cucumber-steps-generator'

let baseline_screenshots_path, latest_screenshots_path, diff_screenshots_path
Before((testCase, cb) => {
  const feature = testCase.sourceLocation.uri.substr(13).split('.')[0]
  const scenario = testCase.pickle.name.replace(helpers.illegalFilenameCharactersRegExp, '')
  const settings = client.globals.test_settings.visual_regression_settings
  baseline_screenshots_path = \`\${settings.baseline_screenshots_path}/\${feature}/\${scenario}\`
  latest_screenshots_path = \`\${settings.latest_screenshots_path}/\${feature}/\${scenario}\`
  diff_screenshots_path = \`\${settings.diff_screenshots_path}/\${feature}/\${scenario}\`
  cb()
})

const context = { client, xpath, variables }\n\n`

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

  fs.writeFile(paths.generatedSteps, `${header}${body}`, err => {
    if (err) {
      console.error(err)
    }
    console.log('#')
    console.log(`# CONGRATS! The steps were generated into ${paths.generatedSteps}`)
    console.log('#')
  })
}
