const { illegalFilenameCharactersRegExp, funcRegEx, extendXpath, xpathToFileName, lastElement, elementAtPosition } = require('./utils')

describe('utils', () => {
  describe('illegalFilenameCharactersRegExp', () => {
    it('matches predefined set of characters', () => {
      expect('<>:"/\|?* '.replace(illegalFilenameCharactersRegExp, '')).toBe('')
    })
  })

  describe('funcRegEx', () => {
    it('creates regex for function with string argument', () => {
      expect(funcRegEx('func-name')).toEqual(/func-name\(\"([^\"]+)\"\)/g)
    })
  })

  describe('extendXpath', () => {
    it('extends xpath with has-class("string")', () => {
      expect(extendXpath(`//div[has-class("class") and has-class("two classes") and has-class("specials chars ('±!@#$%^&*_=+<>,./\\|{}[]~)")]`))
        .toEqual(`//div[contains(concat(" ", normalize-space(@class), " "), " class ") and contains(concat(" ", normalize-space(@class), " "), " two classes ") and contains(concat(" ", normalize-space(@class), " "), " specials chars ('±!@#$%^&*_=+<>,./\\|{}[]~) ")]`)
    })

    it('extends xpath with has-text("string")', () => {
      expect(extendXpath(`//div[has-text("I'm some text #1")]`)).toEqual(`//div[contains(text(), "I'm some text #1")]`)
    })

    it('extends xpath with text-is("string")', () => {
      expect(extendXpath(`//div[text-is("I'm some exact text, 100%")]`)).toEqual(`//div[normalize-space(text())="I'm some exact text, 100%"]`)
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
