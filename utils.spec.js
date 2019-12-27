const { illegalFilenameCharactersRegExp, funcRegEx, extendXpath, xpathToFileName, lastElement, elementAtPosition } = require('./utils')

const allowedSymbols = '(\'±!@#$%^&*_=+<>,./\\|{}[]~)'
const xpath = {
  specialSymbols: `//a[has-class("${allowedSymbols}") or has-text("${allowedSymbols}") or text-is("${allowedSymbols}")]`,
  hasClass: `//div[has-class("class1") and has-class("class2")]`,
  hasText: `//*[@id="app" and has-text("text1")]`,
  textIs: `//div[text-is("exact-text") or @id="app"]`,
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
    it('passes special symbols', () => {
      expect(extendXpath(xpath.specialSymbols))
        .toEqual(`//a[contains(concat(" ", normalize-space(@class), " "), " ${allowedSymbols} ") or contains(normalize-space(text()), "${allowedSymbols}") or normalize-space(text())="${allowedSymbols}"]`)
    })

    it('extends xpath with has-class("string")', () => {
      expect(extendXpath(xpath.hasClass))
        .toEqual(`//div[contains(concat(" ", normalize-space(@class), " "), " class1 ") and contains(concat(" ", normalize-space(@class), " "), " class2 ")]`)
    })

    it('extends xpath with has-text("string")', () => {
      expect(extendXpath(xpath.hasText))
        .toEqual(`//*[@id="app" and contains(normalize-space(text()), "text1")]`)
    })

    it('extends xpath with text-is("string")', () => {
      expect(extendXpath(xpath.textIs))
        .toEqual(`//div[normalize-space(text())="exact-text" or @id="app"]`)
    })
  })

  describe('xpathToFileName', () => {
    it('removes illegal characters', () => {
      expect(xpathToFileName('<>:"/\|?* ')).toBe('')
    })

    it('formats and/or inside xpath selector', () => {
      expect(xpathToFileName(extendXpath(xpath.andOr)))
        .toBe('el_with_id=app_and_with_class=main_or_with_type=password')
    })

    it('formats has-class extended xpath', () => {
      expect(xpathToFileName(extendXpath(xpath.hasClass)))
        .toBe("div_with_class=class1_and_with_class=class2")
    })

    it('formats has-text extended xpath', () => {
      expect(xpathToFileName(extendXpath(xpath.hasText)))
        .toBe("el_with_id=app_and_with_text=text1")
    })

    it('formats text-is extended xpath', () => {
      expect(xpathToFileName(extendXpath(xpath.textIs)))
        .toBe("div_with_text=exact-text_or_with_id=app")
    })

    it('formats xpath concat', () => {
      expect(xpathToFileName(extendXpath(xpath.hasClass) + extendXpath(xpath.hasText)))
        .toBe("div_with_class=class1_and_with_class=class2_el_with_id=app_and_with_text=text1")
    })

    it('formats xpath concat', () => {
      expect(xpathToFileName(lastElement(extendXpath(xpath.hasClass)) + extendXpath(xpath.hasText)))
        .toBe("div_with_class=class1_and_with_class=class2_last_el_with_id=app_and_with_text=text1")
    })

    it('formats lastElement', () => {
      expect(xpathToFileName(lastElement(extendXpath(xpath.hasClass))))
        .toBe("div_with_class=class1_and_with_class=class2_last")
    })

    it('formats elementAtPosition', () => {
      expect(xpathToFileName(elementAtPosition(extendXpath(xpath.hasClass), 5)))
        .toBe("div_with_class=class1_and_with_class=class2_5")
    })

    it('converts to lowercase', () => {
      expect(xpathToFileName('//div[@class="UPPERCASE"]'))
        .toBe('div_with_class=uppercase')
    })
  })

  describe('lastElement', () => {
    it('adds last() to the end of xpath', () => {
      expect(lastElement('//li[@class="item"]'))
        .toBe('(//li[@class="item"])[last()]')
    })
  })

  describe('elementAtPosition', () => {
    it('adds position number to the end of xpath', () => {
      expect(elementAtPosition('//li[@class="item"]', 5))
        .toBe('(//li[@class="item"])[5]')
    })
  })
})
