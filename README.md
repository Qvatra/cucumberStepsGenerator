# Cucumber steps generator
Package provides a DRY way of creating cucumber steps using combinations of predefined set of actions, targets and areas.
Action can by applied to target that is located in area. 
Targets and areas contain set of xpath selectors while actions contain nightwatch commands.

## Installation
```npm i -D cucumber-steps-generator```

### Dependencies
1. nigthwatch-api
2. cucumber 

## Steps generator configuration
to generate steps create generate.js, config.js, actions.js, targets.js and areas.js and run:  
```node ./e2e/stepsGenerator/generate.js```  
``` 
//generate.js
const path = require('path')
const { generateSteps } = require('cucumber-steps-generator')

generateSteps({
  outputFile: {
    path: path.resolve(__dirname, './generatedSteps.js'),
    injections: {
      helpers: path.resolve(__dirname, '../helpers.js') // possibility to inject custom modules
    }
  },
  configPath: path.resolve(__dirname, './config.js'),
  actionsPath: path.resolve(__dirname, './actions.js'),
  targetsPath: path.resolve(__dirname, './targets.js'),
  areasPath: path.resolve(__dirname, './areas.js')
})
```
```
//config.js
const { extendXpath } = require('cucumber-steps-generator')
const testEnv = process.env.env || 'dev'

module.exports = {
  variables: {
    url: ['qa, stg'].includes(testEnv) ?  `https://sitename-${testEnv}.domain.com` : 'localhost:8080',
  },
  // this section provides all possible set of selectors/selector functions for the website
  xpath: {
    button: {
      withTextOrClass: text => extendXpath(`//button[has-text("${text}") or has-class('${text}')]`),
    },
    input: {
      withName: name => extendXpath(`//*[(self::input or self::textarea) and @name="${name}"]`),
    },
    select: {
      withName: name => extendXpath(`//select/option[text-is("${name}")]/parent::select`)
    },
    navbar: {
      top: extendXpath(`//nav[has-class('navbar') and has-class('sticky-top')]`),
    },
    modal: {
      content: extendXpath(`//div[has-class('modal-dialog')]`),
    },
    link: {
      withText: text => extendXpath(`//a[has-text("${text}")]`),
    }
  }
}
```
```
//actions.js
module.exports = {
  followUrl: {
    // {string} is placeholder. In gherkin it may look: Given I redirect to "/home"
    gherkin: 'I redirect to {string}',
    // empty targets array means that action can not be used with targets
    targets: [],
    // func takes ctx as first arg and then arguments for each placeholder in gherkin part so 'path' here is "/home"
    func: ({ client, variables }, path) => client.useXpath().url(variables.url + path)
  },
  type: {
    // {target} placeholder is used for inserting defined targets: I type "Alex" in input "name"
    gherkin: 'I type {string} in {target}',
    // provided targets mean that action can be used only with targets having mentioned key
    targets: ['inputWithName'],
    // here value is "Alex" and target is `input "name"` which corresponds to key 'inputWithName' in targets.js file
    func: ({ client }, value, target) => client.useXpath().setValue(target, value)
  },
  xpathClick: {
    gherkin: 'I click {target}',
    // not defining targets here indicates that action could be appliead to any target
    func: ({ client }, target) => client.useXpath().click(target)
  }
}
```
```
//targets.js
module.exports = {
  link: {
    gherkin: 'link {string}', // {string} is placeholder. In gherkin it may look: And I click link "click here"
    // areas work the same way as in actions. Areas specify where target is located to solve multiple DOM matches
    areas: ['modal'],
    // func takes ctx as first arg and then arguments for each placeholder in gherkin part so text here is "click here"
    // xpath here refers to config.js xpath definitions
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
```
//areas.js
module.exports = {
  topNavbar: {
    gherkin: 'in top navbar',
    // xpath here refers to config.js xpath definitions
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
Part of the output file for the given configuration:
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

## Context
A context objext is passed as first argument to action, target and area functions.  
Context can contain:  
- **client** - nightwatch client contains all the nightwatch functions. Used in actions.  
- **xpath** - refers to xpath section of config.js. Contains full list of xpath selectors for the website.  
- **variables** - refers to variables section of config.js. Might be usefull when shared state is required between the sessions or for defining constants.  
- **utils** - a set of built in function (see section below)  
- **injections** - if provided in generate.js exposes custom modules in steps  

## Utils
- **extendXpath** - extends xpath string with functions (see config.js for examples):  
   - *has-class("className")* - maches elements, class of which contain className class,  
   - *has-text("textPart")* - maches elements, text of which contain textPart text,  
   - *text-is("textExact")* - maches elements that have text === textExact  
- **xpathToFileName** - converts xpath strings into valid readable filenames. 
   Can be usefull to name file after xpath when taking screenshots
- **lastElement** - returns last element matched given xpath
- **elementAtPosition** - returns element at given position matched given xpath
- **illegalFilenameCharactersRegExp** - regExp for maching illegal filenames

## Todos:
- Area doesnt not work for multiple targets declared with 'OR': ```target = target1 | target2```  
   It renders: ```//area//target1 | target2``` instead of ```//area//target1 | //area//target2```  
   Workaround for now: 'OR' should be declared in a single target selector: ```//div[@target="1" or @target="2"]```
- Cover action, target, area combinations with unit tests
