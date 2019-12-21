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
      expect(extendXpath(`//*[@id="app" and has-text("I'm some text #1")]`)).toEqual(`//*[@id="app" and contains(text(), "I'm some text #1")]`)
    })

    it('extends xpath with text-is("string")', () => {
      expect(extendXpath(`//div[text-is("I'm some exact text, 100%") or @id="app"]`)).toEqual(`//div[normalize-space(text())="I'm some exact text, 100%" or @id="app"]`)
    })
  })

  describe('xpathToFileName', () => {
    it('removes illegal characters', () => {
      expect(xpathToFileName('<>:"/\|?* ')).toBe('')
    })

    it('formats and inside xpath selector', () => {
      expect(xpathToFileName('//a[@id="link" and contains(text(), "text1")]')).toBe('a_with_id_link_and_with_text_text1')
    })

    it('formats or inside xpath selector', () => {
      expect(xpathToFileName('//*[contains(text(), "text1") or @href="ref" or text()="Submit"]')).toBe('el_with_text_text1_or_with_href_ref_or_text_submit')
    })

    it('formats has-class extended xpath', () => {
      expect(xpathToFileName('//div[contains(concat(" ", normalize-space(@class), " "), " class1 ")]')).toBe('div_with_class_class1')
    })

    it('formats has-text extended xpath', () => {
      expect(xpathToFileName('//div[contains(text(), "text1")]')).toBe('div_with_text_text1')
    })

    it('formats text-is extended xpath', () => {
      expect(xpathToFileName('//div[normalize-space(text())="exact-text"]')).toBe('div_with_text_exact-text')
    })

    it('converts to lowercase', () => {
      expect(xpathToFileName('//div[@class="UPPERCASE"]')).toBe('div_with_class_uppercase')
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
