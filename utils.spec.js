const { illegalFilenameCharactersRegExp, funcRegEx, extendXpath, xpathToFileName, lastElement, elementAtPosition } = require('./utils')

const xpath = {
  hasClass: `//div[has-class("class") and has-class("specials chars ('±!@#$%^&*_=+<>,./\\|{}[]~)")]`,
  hasText: `//*[@id="app" and has-text("I'm some text #1")]`,
  textIs: `//div[text-is("I'm some exact text, 100%") or @id="app"]`,
  andOr: `//*[@id="app" and @class="main" or @type="password"]`
}

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
      expect(extendXpath(xpath.hasClass))
        .toEqual(`//div[contains(concat(" ", normalize-space(@class), " "), " class ") and contains(concat(" ", normalize-space(@class), " "), " specials chars ('±!@#$%^&*_=+<>,./\\|{}[]~) ")]`)
    })

    it('extends xpath with has-text("string")', () => {
      expect(extendXpath(xpath.hasText))
        .toEqual(`//*[@id="app" and contains(normalize-space(text()), "I'm some text #1")]`)
    })

    it('extends xpath with text-is("string")', () => {
      expect(extendXpath(xpath.textIs))
        .toEqual(`//div[normalize-space(text())="I'm some exact text, 100%" or @id="app"]`)
    })
  })

  describe('xpathToFileName', () => {
    it('removes illegal characters', () => {
      expect(xpathToFileName('<>:"/\|?* ')).toBe('')
    })

    it('formats and/or inside xpath selector', () => {
      expect(xpathToFileName(extendXpath(xpath.andOr)))
        .toBe('el_with_id_app_and_with_class_main_or_with_type_password')
    })

    it('formats has-class extended xpath', () => {
      expect(xpathToFileName(extendXpath(xpath.hasClass)))
        .toBe("div_with_class_class_and_with_class_specialschars'±!with_#$%^&__+,.{}_~")
    })

    it('formats has-text extended xpath', () => {
      expect(xpathToFileName(extendXpath(xpath.hasText)))
        .toBe("el_with_id_app_and_with_text_i'msometext#1")
    })

    it('formats text-is extended xpath', () => {
      expect(xpathToFileName(extendXpath(xpath.textIs)))
        .toBe("div_with_text_i'msomeexacttext,100%_or_with_id_app")
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
