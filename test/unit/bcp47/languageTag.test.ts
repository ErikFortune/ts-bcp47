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
import { LanguageTag, Subtags, TagValidity } from '../../../src/bcp47';
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
        class CreateFromPartsTestCase extends SimpleTagTestCaseBase<Subtags> {
            public static get factory(): GenericTagTestCaseFactory<Subtags, CreateFromPartsTestCase> {
                return new GenericTagTestCaseFactory(CreateFromPartsTestCase.create);
            }

            public static create(gtc: GenericLanguageTagTest<Subtags>, which: TestKey): CreateFromPartsTestCase {
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

    describe('to* methods', () => {
        class ToMethodTestCase<TFROM extends string | Subtags> extends SimpleTagTestCaseBase<TFROM> {
            public static create<TFROM extends string | Subtags>(
                gtc: GenericLanguageTagTest<TFROM>,
                which: TestKey
            ): ToMethodTestCase<TFROM> {
                return new ToMethodTestCase(gtc, which);
            }

            public static getFactory<TFROM extends string | Subtags>(): GenericTagTestCaseFactory<TFROM, ToMethodTestCase<TFROM>> {
                return new GenericTagTestCaseFactory(ToMethodTestCase.create);
            }

            public invoke(): void {
                if (this.isSuccessTest) {
                    expect(LanguageTag.create(this.from)).toSucceedAndSatisfy((lt) => {
                        if (this.options?.normalization === 'preferred') {
                            expect(lt.toPreferred()).toSucceedAndSatisfy((plt) => {
                                expect(plt.tag).toEqual(this.expected);
                            });
                        } else if (this.options?.validity == 'strictly-valid') {
                            expect(lt.toStrictlyValid()).toSucceedAndSatisfy((slt) => {
                                expect(slt.tag).toEqual(this.expected);
                            });
                        } else if (this.options?.validity == 'valid') {
                            expect(lt.toValid()).toSucceedAndSatisfy((vlt) => {
                                expect(vlt.tag).toEqual(this.expected);
                            });
                        } else if (this.options?.normalization === 'canonical') {
                            expect(lt.toCanonical()).toSucceedAndSatisfy((clt) => {
                                expect(clt.tag).toEqual(this.expected);
                            });
                        } else {
                            expect('options').toMatch('test');
                        }
                    });
                } else if (this.isFailureTest) {
                    expect(LanguageTag.create(this.from)).toSucceedAndSatisfy((lt) => {
                        if (this.options?.normalization === 'preferred') {
                            expect(lt.toPreferred()).toFailWith(this.expected);
                        } else if (this.options?.validity == 'strictly-valid') {
                            expect(lt.toStrictlyValid()).toFailWith(this.expected);
                        } else if (this.options?.validity == 'valid') {
                            expect(lt.toValid()).toFailWith(this.expected);
                        } else if (this.options?.normalization === 'canonical') {
                            expect(lt.toCanonical()).toFailWith(this.expected);
                        } else {
                            expect('options').toMatch('test');
                        }
                    });
                }
            }

            protected _getTestTarget(which: TestKey, _gtc: GenericLanguageTagTest<TFROM, string | RegExp>): string {
                switch (which) {
                    case 'valid':
                        return 'toValid';
                    case 'strictlyValid':
                        return 'toStrictlyValid';
                    case 'wellFormedCanonical':
                        return 'toCanonical';
                    case 'preferred':
                        return 'toPreferred';
                }
                return which;
            }

            protected _getExpectedValue(
                which: TestKey,
                gtc: GenericLanguageTagTest<TFROM, string | RegExp>,
                expected: string | RegExp | undefined
            ): string | RegExp | undefined {
                switch (which) {
                    case 'default':
                    case 'strictlyValidCanonical':
                    case 'strictlyValidPreferred':
                    case 'validCanonical':
                    case 'wellFormed':
                        return undefined;
                }
                // we can't do anything with a test case that expects to fail
                // even basic validation
                if (gtc.expected.default instanceof RegExp) {
                    return undefined;
                }
                return expected;
            }
        }

        describe('tag-based test cases', () => {
            test.each(ToMethodTestCase.getFactory<string>().emit(allTestKeys, tagTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('parts-based test cases', () => {
            test.each(ToMethodTestCase.getFactory<Subtags>().emit(allTestKeys, partsTestCases))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });
    });
});
