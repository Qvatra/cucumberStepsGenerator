# Cucumber steps generator
Provides a DRY way of writing cucumber steps using combinations of predefined set of actions, targets and areas

## Installing
```npm i -D https://github.com/Qvatra/cucumberStepsGenerator.git```

## Full e2e + vrt setup
```npm i -D nightwatch nigthwatch-api nightwatch-vrt selenium-server-standalone-jar cucumber cucumber-pretty chromrdriver geckodriver``` 

## Steps generator configuration
in package.json set script:
```"e2e:generate-steps": "node ./e2e/stepsGenerator/generate.js"```  
In folder e2e/stepsGenerator create generate.js, config.js, actions.js, targets.js and areas.js:
```
const path = require('path')
const { generateSteps } = require('cucumber-steps-generator')

generateSteps({
  outputFile: {
    path: path.resolve(__dirname, './generatedSteps.js'),
    importInjections: {
      helpers: path.resolve(__dirname, '../helpers.js') // this is in case you going to use some custom helper functions
    }
  },
  configPath: path.resolve(__dirname, './config.js'),
  actionsPath: path.resolve(__dirname, './actions.js'),
  targetsPath: path.resolve(__dirname, './targets.js'),
  areasPath: path.resolve(__dirname, './areas.js')
})
```
example of config.js:
```
const { extendXpath } = require('cucumber-steps-generator')
const testEnv = process.env.env || 'dev'

module.exports = {
  variables: {
    url: ['qa, stg'].includes(testEnv) ?  `https://sitename-${testEnv}.domain.com` : 'localhost:8080',
  },
  xpath: {
    button: {
      withTextOrClass: text => extendXpath(`//button[text()="${text}" or has-class('${text}')]`),
    },
    input: {
      withName: name => extendXpath(`//*[(self::input or self::textarea) and @name="${name}"]`),
    },
    select: {
      withName: name => extendXpath(`//select/option[text()="${name}"]/parent::select`)
    },
    navbar: {
      top: extendXpath(`//nav[has-class('navbar') and has-class('sticky-top')]`),
    },
    modal: {
      content: extendXpath(`//div[has-class('modal-dialog')]`),
    },
    link: {
      withText: text => extendXpath(`//a[contains(text(),"${text}")]`),
    }
  }
}
```
example of actions.js:
```
module.exports = {
  followUrl: {
    gherkin: 'I redirect to {string}',
    // empty targets array means that action can not be used with any targets
    targets: [],
    func: ({ client, variables }, path) => client.useXpath().url(variables.url + path)
  },
  type: {
    gherkin: 'I type {string} in {target}',
    // provided targets mean that action can be used with targetd having this key in targets file
    targets: ['inputWithName'],
    func: ({ client }, value, target) => client.useXpath().setValue(target, value)
  },
  xpathClick: {
    gherkin: 'I click {target}',
    // not defining targets here indicates that action could be appliead to all targets
    func: ({ client }, target) => client.useXpath().click(target)
  }
}
```
example of targets.js:
```
module.exports = {
  link: {
    gherkin: 'link {string}',
    // areas work the same way as in actions and specify where target is located (to solve multiple DOM matches)
    areas: ['modal'],
    func: ({ xpath }, text) => xpath.link.withText(text)
  },
  buttonWithTextOrClass: {
    gherkin: 'button {string}',
    func: ({ xpath }, text) => xpath.button.withTextOrClass(text)
  },
  inputWithName: {
    gherkin: 'input {string}',
    func: ({ xpath }, name) => xpath.input.withName(name)
  }
}
```
example of areas.js:
```
module.exports = {
  topNavbar: {
    gherkin: 'in top navbar',
    func: ({ xpath }) => xpath.navbar.top
  },
  modal: {
    gherkin: 'in modal',
    func: ({ xpath }) => xpath.modal.content
  },
  hamburgerMenu: {
    gherkin: 'in hamburger menu',
    func: ({ xpath }) => xpath.burger.menuSidebar
  }
}
```
output steps for the given configuration:
```
// action followUrl
Then(/^I redirect to "([^"]+)"$/, (arg1) => {
  return (({ client, variables }, path) => client.useXpath().url(variables.url + path))(context, arg1)
})
// action type on target inputWithName
Then(/^I type "([^"]+)" in input "([^"]+)"$/, (arg1, arg2) => {
  const path = (({ xpath }, name) => xpath.input.withName(name))(context, arg2)
  return (({ client }, value, target) => client.useXpath().setValue(target, value))(context, arg1, path)
})
// action type on target inputWithName in area topNavbar
Then(/^I type "([^"]+)" in input "([^"]+)" in top navbar$/, (arg1, arg2) => {
  const path = (({ xpath }) => xpath.navbar.top)(context) + (({ xpath }, name) => xpath.input.withName(name))(context, arg2)
  return (({ client }, value, target) => client.useXpath().setValue(target, value))(context, arg1, path)
})
// action type on target inputWithName in area modal
Then(/^I type "([^"]+)" in input "([^"]+)" in modal$/, (arg1, arg2) => {
  const path = (({ xpath }) => xpath.modal.content)(context) + (({ xpath }, name) => xpath.input.withName(name))(context, arg2)
  return (({ client }, value, target) => client.useXpath().setValue(target, value))(context, arg1, path)
})
// action type on target inputWithName in area hamburgerMenu
Then(/^I type "([^"]+)" in input "([^"]+)" in hamburger menu$/, (arg1, arg2) => {
  const path = (({ xpath }) => xpath.burger.menuSidebar)(context) + (({ xpath }, name) => xpath.input.withName(name))(context, arg2)
  return (({ client }, value, target) => client.useXpath().setValue(target, value))(context, arg1, path)
})
// action xpathClick on target link
Then(/^I click link "([^"]+)"$/, (arg1) => {
  const path = (({ xpath }, text) => xpath.link.withText(text))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target link in area modal
Then(/^I click link "([^"]+)" in modal$/, (arg1) => {
  const path = (({ xpath }) => xpath.modal.content)(context) + (({ xpath }, text) => xpath.link.withText(text))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target buttonWithTextOrClass
Then(/^I click button "([^"]+)"$/, (arg1) => {
  const path = (({ xpath }, text) => xpath.button.withTextOrClass(text))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target buttonWithTextOrClass in area topNavbar
Then(/^I click button "([^"]+)" in top navbar$/, (arg1) => {
  const path = (({ xpath }) => xpath.navbar.top)(context) + (({ xpath }, text) => xpath.button.withTextOrClass(text))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target buttonWithTextOrClass in area modal
Then(/^I click button "([^"]+)" in modal$/, (arg1) => {
  const path = (({ xpath }) => xpath.modal.content)(context) + (({ xpath }, text) => xpath.button.withTextOrClass(text))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target buttonWithTextOrClass in area hamburgerMenu
Then(/^I click button "([^"]+)" in hamburger menu$/, (arg1) => {
  const path = (({ xpath }) => xpath.burger.menuSidebar)(context) + (({ xpath }, text) => xpath.button.withTextOrClass(text))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target inputWithName
Then(/^I click input "([^"]+)"$/, (arg1) => {
  const path = (({ xpath }, name) => xpath.input.withName(name))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target inputWithName in area topNavbar
Then(/^I click input "([^"]+)" in top navbar$/, (arg1) => {
  const path = (({ xpath }) => xpath.navbar.top)(context) + (({ xpath }, name) => xpath.input.withName(name))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target inputWithName in area modal
Then(/^I click input "([^"]+)" in modal$/, (arg1) => {
  const path = (({ xpath }) => xpath.modal.content)(context) + (({ xpath }, name) => xpath.input.withName(name))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
// action xpathClick on target inputWithName in area hamburgerMenu
Then(/^I click input "([^"]+)" in hamburger menu$/, (arg1) => {
  const path = (({ xpath }) => xpath.burger.menuSidebar)(context) + (({ xpath }, name) => xpath.input.withName(name))(context, arg1)
  return (({ client }, target) => client.useXpath().click(target))(context, path)
})
```

## Helpers
1. *extendXpath* - provides space normalization for classes and text with ```has-class()``` and ```text()``` methods.  
   Example: ```const btnWithTextOrClass = text => extendXpath(`//button[text()="${text}" or has-class('${text}')]`)```
2. *xpathToFileName* - converts xpath strings into valid filenames. Can be usefull when saving screenshots per xpath selector
3. *lastElement* - returns last element matched given xpath
4. *elementAtPosition* - returns element at given position matched given xpath
5. *illegalFilenameCharactersRegExp* - regExp for maching illegal filenames

## Possible improvements:
1. Area doesnt not work for multiple targets declared with 'OR': ```target = target1 | target2```  
   It renders: ```//area//target1 | target2``` instead of ```//area//target1 | //area//target2```  
   To get it working 'OR' should be declared in a single target selector: ```//div[@target="1" or @target="2"]```
