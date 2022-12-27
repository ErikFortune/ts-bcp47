/*
 * Copyright (c) 2022 Erik Fortune
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import '@fgv/ts-utils-jest';

import {
    GenericLanguageTagTest,
    GenericLanguageTagTestInit,
    GenericTagTestCaseFactory,
    SimpleTagTestCaseBase,
    TestKey,
    allCanonicalTestKeys,
    allNonCanonicalTestKeys,
    allNonPreferredCanonicalKeys,
    allPreferredKeys,
    allTestKeys,
    allValidatingKeys,
} from './languageTagHelpers';
import { LanguageTag, LanguageTagParts } from '../../../src/bcp47';
import { ExtLangSubtag } from '../../../src/iana/language-subtags';

export class CreateFromTagTestCase extends SimpleTagTestCaseBase<string> {
    public static create(gtc: GenericLanguageTagTest<string>, which: TestKey): CreateFromTagTestCase {
        return new CreateFromTagTestCase(gtc, which);
    }

    public invoke(): void {
        if (typeof this.expected === 'string') {
            expect(LanguageTag.createFromTag(this.from, this.options)).toSucceedAndSatisfy((lt) => {
                expect(lt.tag).toEqual(this.expected);
            });
        } else if (this.expected instanceof RegExp) {
            expect(LanguageTag.createFromTag(this.from, this.options)).toFailWith(this.expected);
        }
    }
}

export const createFromTagTestCaseFactory = new GenericTagTestCaseFactory(CreateFromTagTestCase.create);

export class CreateFromPartsTestCase extends SimpleTagTestCaseBase<LanguageTagParts> {
    public static create(gtc: GenericLanguageTagTest<LanguageTagParts>, which: TestKey): CreateFromPartsTestCase {
        return new CreateFromPartsTestCase(gtc, which);
    }

    public invoke(): void {
        if (typeof this.expected === 'string') {
            expect(LanguageTag.createFromParts(this.from, this.options)).toSucceedAndSatisfy((lt) => {
                expect(lt.tag).toEqual(this.expected);
            });
        } else if (this.expected instanceof RegExp) {
            expect(LanguageTag.createFromParts(this.from, this.options)).toFailWith(this.expected);
        }
    }
}

export const createFromPartsTestCaseFactory = new GenericTagTestCaseFactory(CreateFromPartsTestCase.create);

const testCaseInit: GenericLanguageTagTestInit<string>[] = [
    {
        description: 'valid canonical primary language',
        from: 'en',
        expected: [['en', allTestKeys]],
    },
    {
        description: 'valid non-canonical primary language',
        from: 'EN',
        expected: [
            ['EN', allNonCanonicalTestKeys],
            ['en', allCanonicalTestKeys],
        ],
    },
    {
        description: 'invalid primary language',
        from: 'ENG',
        expected: [
            ['ENG', ['default', 'wellFormed']],
            ['eng', ['wellFormedCanonical']],
            [/invalid language/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid canonical extlang',
        from: 'zh-cmn',
        expected: [
            ['zh-cmn', [...allNonCanonicalTestKeys, ...allNonPreferredCanonicalKeys]],
            ['cmn', allPreferredKeys],
        ],
    },
    {
        description: 'valid non-canonical extlang',
        from: 'ZH-Cmn',
        expected: [
            ['ZH-Cmn', allNonCanonicalTestKeys],
            ['zh-cmn', allCanonicalTestKeys],
            ['cmn', allPreferredKeys],
        ],
    },
    {
        description: 'invalid extlang',
        from: 'zh-Han',
        expected: [
            ['zh-Han', ['default', 'wellFormed']],
            ['zh-han', ['wellFormedCanonical']],
            [/invalid extlang/i, allValidatingKeys],
        ],
    },
    {
        description: 'multiple extlang',
        from: 'zh-cmn-yue',
        expected: [
            ['zh-cmn-yue', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/too many extlang/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid non-canonical, non-suppressed script',
        from: 'zh-LATN',
        expected: [
            ['zh-LATN', allNonCanonicalTestKeys],
            ['zh-Latn', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid non-canonical, suppressed script',
        from: 'en-LATN',
        expected: [
            ['en-LATN', allNonCanonicalTestKeys],
            ['en-Latn', allNonPreferredCanonicalKeys],
            ['en', allPreferredKeys],
        ],
    },
    {
        description: 'invalid script',
        from: 'en-AaaA',
        expected: [
            ['en-AaaA', ['default', 'wellFormed']],
            ['en-Aaaa', ['wellFormedCanonical']],
            [/invalid script/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid non-canonical iso3166-2 region',
        from: 'en-aq',
        expected: [
            ['en-aq', allNonCanonicalTestKeys],
            ['en-AQ', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid non-canonical UN M.49 region',
        from: 'es-419',
        expected: [['es-419', allTestKeys]],
    },
    {
        description: 'invalid region',
        from: 'en-AJ',
        expected: [
            ['en-AJ', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/invalid region/i, allValidatingKeys],
        ],
    },
    {
        description: 'strictly valid non-canonical variant',
        from: 'ca-Valencia',
        expected: [
            ['ca-Valencia', allNonCanonicalTestKeys],
            ['ca-valencia', allCanonicalTestKeys],
        ],
    },
    {
        description: 'not strictly-valid non-canonical variant',
        from: 'fr-Valencia',
        expected: [
            ['fr-Valencia', ['default', 'wellFormed', 'valid']],
            ['fr-valencia', ['wellFormedCanonical', 'validCanonical', 'preferred']],
            [/invalid prefix/i, ['strictlyValid', 'strictlyValidCanonical', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'strictly valid multiple variants',
        from: 'SL-Rozaj-Lipaw',
        expected: [
            ['SL-Rozaj-Lipaw', allNonCanonicalTestKeys],
            ['sl-rozaj-lipaw', allCanonicalTestKeys],
        ],
    },
    {
        description: 'invalid variant',
        from: 'ca-ES-xyzzy',
        expected: [
            ['ca-ES-xyzzy', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/invalid variant/i, allValidatingKeys],
        ],
    },
    {
        description: 'invalid variant',
        from: 'ca-valencia-valencia',
        expected: [
            ['ca-valencia-valencia', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/duplicate variant/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid extensions',
        from: 'en-us-u-en-US-t-MT',
        expected: [
            ['en-us-u-en-US-t-MT', allNonCanonicalTestKeys],
            ['en-US-u-en-US-t-mt', allCanonicalTestKeys],
        ],
    },
    {
        description: 'invalid extension',
        from: 'es-us-a-extend',
        expected: [
            ['es-us-a-extend', ['default', 'wellFormed']],
            ['es-US-a-extend', ['wellFormedCanonical']],
            [/invalid.*extension/i, allValidatingKeys],
        ],
    },
    {
        description: 'duplicate extension',
        from: 'es-us-u-US-u-GB',
        expected: [
            ['es-us-u-US-u-GB', ['default', 'wellFormed']],
            ['es-US-u-us-u-gb', ['wellFormedCanonical']],
            [/duplicate.*extension/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid private-use subtag',
        from: 'en-x-Pig-Latin',
        expected: [
            ['en-x-Pig-Latin', allNonCanonicalTestKeys],
            ['en-x-pig-latin', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid grandfathered tag with no preferredValue',
        from: 'i-Mingo',
        expected: [
            ['i-Mingo', allNonCanonicalTestKeys],
            ['i-mingo', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid grandfathered tag with preferredValue',
        from: 'art-lojban',
        expected: [
            ['art-lojban', [...allNonCanonicalTestKeys, ...allNonPreferredCanonicalKeys]],
            ['jbo', allPreferredKeys],
        ],
    },
    {
        description: 'valid grandfathered tag with complex preferred value',
        from: 'en-gb-oed',
        expected: [
            ['en-gb-oed', allNonCanonicalTestKeys],
            ['en-GB-oed', allNonPreferredCanonicalKeys],
            ['en-GB-oxendict', allPreferredKeys],
        ],
    },
];

const partsTestCaseInit: GenericLanguageTagTestInit<LanguageTagParts>[] = [
    {
        description: 'missing primary language',
        from: { extlangs: ['cmn' as ExtLangSubtag, 'yue' as ExtLangSubtag] },
        expected: [[/missing primary language/i, allTestKeys]],
    },
];

const tagTestCases = testCaseInit.map(GenericLanguageTagTest.mapInitToTestCases);
const partsTestCases = partsTestCaseInit.map(GenericLanguageTagTest.mapInitToTestCases);

describe('LanguageTag class', () => {
    describe('createFromTag static method', () => {
        describe('default options', () => {
            test.each(createFromTagTestCaseFactory.emit('default', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('well-formed', () => {
            test.each(createFromTagTestCaseFactory.emit('wellFormed', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('well-formed canonical', () => {
            test.each(createFromTagTestCaseFactory.emit('wellFormedCanonical', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('valid', () => {
            test.each(createFromTagTestCaseFactory.emit('valid', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('valid canonical', () => {
            test.each(createFromTagTestCaseFactory.emit('validCanonical', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('preferred', () => {
            test.each(createFromTagTestCaseFactory.emit('preferred', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid', () => {
            test.each(createFromTagTestCaseFactory.emit('strictlyValid', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid canonical', () => {
            test.each(createFromTagTestCaseFactory.emit('strictlyValidCanonical', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid preferred', () => {
            test.each(createFromTagTestCaseFactory.emit('strictlyValidPreferred', tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });
    });

    describe('createFromParts static method', () => {
        describe('default options', () => {
            test.each(createFromPartsTestCaseFactory.emit('default', partsTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });
    });
});
