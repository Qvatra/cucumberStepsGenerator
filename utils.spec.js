const { illegalFilenameCharactersRegExp, funcRegEx, extendXpath, xpathToFileName, lastElement, elementAtPosition } = require('./utils')

describe('utils', () => {
  describe('illegalFilenameCharactersRegExp', () => {
    it('matches predefined set of characters', () => {
      expect('<>:"/\|?* '.replace(illegalFilenameCharactersRegExp, '')).toBe('')
    })
  })

  describe('funcRegEx', () => {
    it('creates regex for function with string argument', () => {
      expect(funcRegEx('func-name')).toEqual(/func-name\(['"]([^'"]+)['"]\)/g)
    })
  })

  describe('extendXpath', () => {
    it('extends xpath with has-class', () => {
      expect(extendXpath('//div[has-class("class1")]')).toEqual('//div[contains(concat(" ", normalize-space(@class), " "), " class1 ")]')
    })

    it('extends xpath with has-text', () => {
      expect(extendXpath('//div[has-text("text1")]')).toEqual('//div[contains(text(), "text1")]')
    })

    it('extends xpath with text-is', () => {
      expect(extendXpath('//div[text-is("exact-text")]')).toEqual('//div[normalize-space(text())="exact-text"]')
    })
  })

  describe('xpathToFileName', () => {
    it('removes illegal characters', () => {
      expect(xpathToFileName('<>:"/\|?* ')).toBe('')
    })

    it('formats and inside xpath selector', () => {
      expect(xpathToFileName(' and ')).toBe('_and_')
    })

    it('formats or inside xpath selector', () => {
      expect(xpathToFileName(' or ')).toBe('_or_')
    })

    it('formats has-class extended xpath', () => {
      expect(xpathToFileName('//div[contains(concat(" ", normalize-space(@class), " "), " class1 ")]')).toBe('div[has-class_class1]')
    })

    it('formats has-text extended xpath', () => {
      expect(xpathToFileName('//div[contains(text(), "text1")]')).toBe('div[has-text_text1]')
    })

    it('formats text-is extended xpath', () => {
      expect(xpathToFileName('//div[normalize-space(text())="exact-text"]')).toBe('div[text-is_exact-text]')
    })
  })

  describe('lastElement', () => {
    it('adds last() to the end of xpath', () => {
      expect(lastElement('//li[@class="item"]')).toBe('(//li[@class="item"])[last()]')
    })
  })

  describe('elementAtPosition', () => {
    it('adds position number to the end of xpath', () => {
      expect(elementAtPosition('//li[@class="item"]', 5)).toBe('(//li[@class="item"])[5]')
    })
  })
})
