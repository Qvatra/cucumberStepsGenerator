# Cucumber steps generator

## Installing
```npm i -D https://github.com/Qvatra/cucumberStepsGenerator.git```

## Configuring
```todo```

## Helpers
1. *extendXpath* - provides space normalization for classes and text with ```has-class()``` and ```text()``` methods.  
   Example: ```const btnWithTextOrClass = text => extendXpath(`//button[text()="${text}" or has-class('${text}')]`)```
2. *xpathToFileName* - converts xpath strings into valid filenames. Can be usefull when saving screenshots per xpath selector
3. *lastElement* - returns last element matched given xpath
4. *elementAtPosition* - returns element at given position matched given xpath
5. *illegalFilenameCharactersRegExp* - regExp for maching illegal filenames

## Possible improvements:
1. Aria doesnt not work for multiple targets declared with 'OR': ```target = target1 | target2```  
   It renders: ```//aria//target1 | target2``` instead of ```//aria//target1 | //aria//target2```  
   To get it working 'OR' should be declared in a single target selector: ```//div[@target="1" or @target="2"]```
