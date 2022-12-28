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

import { GenericLanguageTagTest, GenericTagTestCaseFactory, SimpleTagTestCaseBase, TestKey, allTestKeys } from './languageTagHelpers';
import { LanguageTag, LanguageTagParts, TagValidity } from '../../../src/bcp47';
import { partsTestCases, tagTestCases } from './commonTestCases';

describe('LanguageTag class', () => {
    describe('createFromTag static method', () => {
        class CreateFromTagTestCase extends SimpleTagTestCaseBase<string> {
            public static get factory(): GenericTagTestCaseFactory<string, CreateFromTagTestCase> {
                return new GenericTagTestCaseFactory(CreateFromTagTestCase.create);
            }

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

        test.each(CreateFromTagTestCase.factory.emit(allTestKeys, tagTestCases))('%p', (_desc, tc) => {
            tc.invoke();
        });
    });

    describe('createFromParts static method', () => {
        class CreateFromPartsTestCase extends SimpleTagTestCaseBase<LanguageTagParts> {
            public static get factory(): GenericTagTestCaseFactory<LanguageTagParts, CreateFromPartsTestCase> {
                return new GenericTagTestCaseFactory(CreateFromPartsTestCase.create);
            }

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

                    // special-case extra test for error handling in the interior of the preferred normalizer,
                    // which is otherwise guarded by a preceding call to validate
                    if (this.options?.normalization === 'preferred') {
                        const options = { ...this.options, validity: 'well-formed' as TagValidity };
                        expect(LanguageTag.createFromParts(this.from, options)).toFailWith(this.expected);
                    }
                }
            }
        }
        test.each(CreateFromPartsTestCase.factory.emit(allTestKeys, partsTestCases))('%p', (_desc, tc) => {
            tc.invoke();
        });
    });
});
