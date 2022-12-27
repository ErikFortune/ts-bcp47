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
import { LanguageTag } from '../../../src/bcp47';
import { LanguageTagInitOptions } from '../../../src/bcp47/languageTag';

interface LanguageTagTestCaseExpected {
    description: string;
    from: string;
    default?: string | RegExp;
    wellFormed?: string | RegExp;
    wellFormedCanonical?: string | RegExp;
    valid?: string | RegExp;
    validCanonical?: string | RegExp;
    preferred?: string | RegExp;
    strictlyValid?: string | RegExp;
    strictlyValidCanonical?: string | RegExp;
    strictlyValidPreferred?: string | RegExp;
}
type TestKeys = keyof Omit<LanguageTagTestCaseExpected, 'description' | 'from'> | 'default';

interface LanguageTagTestCaseInit {
    description: string;
    from: string;
    expected: [string | RegExp | undefined, TestKeys[]][];
}

type CreateFromTagTestCase = [string, string, LanguageTagInitOptions | undefined, string | RegExp];

class LanguageTagTestCase {
    static readonly optionsByKey: Record<TestKeys, LanguageTagInitOptions | undefined> = {
        default: undefined,
        wellFormed: { validity: 'well-formed', normalization: 'none' },
        wellFormedCanonical: { validity: 'well-formed', normalization: 'canonical' },
        valid: { validity: 'valid', normalization: 'none' },
        validCanonical: { validity: 'valid', normalization: 'canonical' },
        preferred: { validity: 'valid', normalization: 'preferred' },
        strictlyValid: { validity: 'strictly-valid', normalization: 'none' },
        strictlyValidCanonical: { validity: 'strictly-valid', normalization: 'canonical' },
        strictlyValidPreferred: { validity: 'strictly-valid', normalization: 'preferred' },
    };

    public readonly expected: LanguageTagTestCaseExpected;
    public constructor(init: LanguageTagTestCaseInit) {
        this.expected = { description: init.description, from: init.from };
        for (const value of init.expected) {
            for (const key of value[1]) {
                this.expected[key] = value[0];
            }
        }
    }

    public static mapInitToTestCases(init: LanguageTagTestCaseInit): LanguageTagTestCase {
        return new LanguageTagTestCase(init);
    }

    public static emitCreateFromTagTestCases(all: LanguageTagTestCase[], which: TestKeys): CreateFromTagTestCase[] {
        return all.map((tc) => tc.emitCreateFromTagTestCase(which)).filter((tc): tc is CreateFromTagTestCase => tc !== undefined);
    }

    public static testCreateFromTag(from: string, options: LanguageTagInitOptions | undefined, expected: string | RegExp) {
        if (expected === 'string') {
            expect(LanguageTag.createFromTag(from, options)).toSucceedAndSatisfy((lt) => {
                expect(lt.tag).toEqual(expected);
            });
        } else if (expected instanceof RegExp) {
            expect(LanguageTag.createFromTag(from, options)).toFailWith(expected);
        }
    }

    public emitCreateFromTagTestCase(which: TestKeys): CreateFromTagTestCase | undefined {
        const options = LanguageTagTestCase.optionsByKey[which];
        const expected = this.expected[which];
        if (typeof expected === 'string') {
            return [
                `${this.expected.description} "${this.expected.from}" succeeds with "${expected}" for ${which}`,
                this.expected.from,
                options,
                expected,
            ];
        } else if (expected instanceof RegExp) {
            return [
                `${this.expected.description} "${this.expected.from}" fails with "${expected}" for ${which}`,
                this.expected.from,
                options,
                expected,
            ];
        }
        return undefined;
    }
}

const testCaseInit: LanguageTagTestCaseInit[] = [
    {
        description: 'well-formed, non-canonical language-region',
        from: 'en-us',
        expected: [
            ['en-us', ['default', 'wellFormed', 'valid', 'strictlyValid']],
            ['en-US', ['wellFormedCanonical', 'validCanonical', 'strictlyValidCanonical', 'preferred', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'valid grandfathered tag',
        from: 'art-lojban',
        expected: [
            [
                'art-lojban',
                ['default', 'wellFormed', 'wellFormedCanonical', 'valid', 'validCanonical', 'strictlyValid', 'strictlyValidCanonical'],
            ],
            ['lbo', ['preferred', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'malformed tag',
        from: 'invalid-tag',
        expected: [
            [
                /no primary language subtag/i,
                [
                    'default',
                    'wellFormed',
                    'wellFormedCanonical',
                    'valid',
                    'validCanonical',
                    'strictlyValid',
                    'strictlyValidCanonical',
                    'strictlyValidPreferred',
                ],
            ],
        ],
    },
];

const testCases = testCaseInit.map(LanguageTagTestCase.mapInitToTestCases);

describe('LanguageTag class', () => {
    describe('create method', () => {
        describe('default options', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'default'))('%p', (_desc, from, options, expected) => {
                LanguageTagTestCase.testCreateFromTag(from, options, expected);
            });
        });

        describe('well-formed', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'wellFormed'))('%p', (_desc, from, options, expected) => {
                LanguageTagTestCase.testCreateFromTag(from, options, expected);
            });
        });

        describe('well-formed canonical', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'wellFormedCanonical'))(
                '%p',
                (_desc, from, options, expected) => {
                    LanguageTagTestCase.testCreateFromTag(from, options, expected);
                }
            );
        });

        describe('valid canonical', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'valid'))('%p', (_desc, from, options, expected) => {
                LanguageTagTestCase.testCreateFromTag(from, options, expected);
            });
        });

        describe('valid canonical', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'validCanonical'))(
                '%p',
                (_desc, from, options, expected) => {
                    LanguageTagTestCase.testCreateFromTag(from, options, expected);
                }
            );
        });

        describe('preferred', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'preferred'))('%p', (_desc, from, options, expected) => {
                LanguageTagTestCase.testCreateFromTag(from, options, expected);
            });
        });

        describe('strictly valid', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'strictlyValid'))(
                '%p',
                (_desc, from, options, expected) => {
                    LanguageTagTestCase.testCreateFromTag(from, options, expected);
                }
            );
        });

        describe('strictly valid canonical', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'strictlyValidCanonical'))(
                '%p',
                (_desc, from, options, expected) => {
                    LanguageTagTestCase.testCreateFromTag(from, options, expected);
                }
            );
        });

        describe('strictly valid preferred', () => {
            test.each(LanguageTagTestCase.emitCreateFromTagTestCases(testCases, 'strictlyValidPreferred'))(
                '%p',
                (_desc, from, options, expected) => {
                    LanguageTagTestCase.testCreateFromTag(from, options, expected);
                }
            );
        });
    });
});
