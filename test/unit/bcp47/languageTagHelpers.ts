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

interface GenericLanguageTagTestExpected {
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

export type TestKey = keyof GenericLanguageTagTestExpected;

export interface GenericLanguageTagTestInit {
    description: string;
    from: string;
    expected: [string | RegExp | undefined, TestKey[]][];
}

export class GenericLanguageTagTest {
    public readonly description: string;
    public readonly from: string;
    public readonly expected: GenericLanguageTagTestExpected;
    public constructor(init: GenericLanguageTagTestInit) {
        this.description = init.description;
        this.from = init.from;

        this.expected = {};
        for (const value of init.expected) {
            for (const key of value[1]) {
                this.expected[key] = value[0];
            }
        }
    }

    public static mapInitToTestCases(init: GenericLanguageTagTestInit): GenericLanguageTagTest {
        return new GenericLanguageTagTest(init);
    }
}

const optionsByKey: Record<TestKey, LanguageTagInitOptions | undefined> = {
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

type CreateFromTagTestCaseData = [string, string, LanguageTagInitOptions | undefined, string | RegExp];

export class CreateFromTagTestCase {
    public static invoke(from: string, options: LanguageTagInitOptions | undefined, expected: string | RegExp) {
        if (expected === 'string') {
            expect(LanguageTag.createFromTag(from, options)).toSucceedAndSatisfy((lt) => {
                expect(lt.tag).toEqual(expected);
            });
        } else if (expected instanceof RegExp) {
            expect(LanguageTag.createFromTag(from, options)).toFailWith(expected);
        }
    }

    public static emitOne(which: TestKey, gtc: GenericLanguageTagTest): CreateFromTagTestCaseData | undefined {
        const options = optionsByKey[which];
        const expected = gtc.expected[which];
        if (typeof expected === 'string') {
            return [`${gtc.description} "${gtc.from}" succeeds with "${expected}" for ${which}`, gtc.from, options, expected];
        } else if (expected instanceof RegExp) {
            return [`${gtc.description} "${gtc.from}" fails with "${expected}" for ${which}`, gtc.from, options, expected];
        }
        return undefined;
    }

    public static emit(which: TestKey, all: GenericLanguageTagTest[]): CreateFromTagTestCaseData[] {
        return all
            .map((gtc) => CreateFromTagTestCase.emitOne(which, gtc))
            .filter((tc): tc is CreateFromTagTestCaseData => tc !== undefined);
    }
}
