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
} from './languageTagHelpers';
import { LanguageTag } from '../../../src/bcp47';

export class CreateFromTagTestCase extends SimpleTagTestCaseBase {
    public static create(gtc: GenericLanguageTagTest, which: TestKey) {
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

const testCaseInit: GenericLanguageTagTestInit[] = [
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
        description: 'valid canonical extlang',
        from: 'zh-cmn',
        expected: [
            ['zh-cmn', [...allNonCanonicalTestKeys, ...allNonPreferredCanonicalKeys]],
            ['cmn', allPreferredKeys],
        ],
    },
    {
        description: 'valid extlang',
        from: 'ZH-Cmn',
        expected: [
            ['ZH-Cmn', allNonCanonicalTestKeys],
            ['zh-cmn', allCanonicalTestKeys],
            ['cmn', allPreferredKeys],
        ],
    },
    {
        description: 'well-formed, non-canonical language-region',
        from: 'en-us',
        expected: [
            ['en-us', allNonCanonicalTestKeys],
            ['en-US', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid grandfathered tag',
        from: 'art-lojban',
        expected: [
            ['art-lojban', [...allNonCanonicalTestKeys, ...allNonPreferredCanonicalKeys]],
            ['jbo', allPreferredKeys],
        ],
    },
    {
        description: 'malformed tag',
        from: 'invalid-tag',
        expected: [[/no primary language subtag/i, allTestKeys]],
    },
];

const genericTests = testCaseInit.map(GenericLanguageTagTest.mapInitToTestCases);

describe('LanguageTag class', () => {
    describe('create method', () => {
        describe('default options', () => {
            test.each(createFromTagTestCaseFactory.emit('default', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('well-formed', () => {
            test.each(createFromTagTestCaseFactory.emit('wellFormed', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('well-formed canonical', () => {
            test.each(createFromTagTestCaseFactory.emit('wellFormedCanonical', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('valid', () => {
            test.each(createFromTagTestCaseFactory.emit('valid', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('valid canonical', () => {
            test.each(createFromTagTestCaseFactory.emit('validCanonical', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('preferred', () => {
            test.each(createFromTagTestCaseFactory.emit('preferred', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid', () => {
            test.each(createFromTagTestCaseFactory.emit('strictlyValid', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid canonical', () => {
            test.each(createFromTagTestCaseFactory.emit('strictlyValidCanonical', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid preferred', () => {
            test.each(createFromTagTestCaseFactory.emit('strictlyValidPreferred', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });
    });
});
