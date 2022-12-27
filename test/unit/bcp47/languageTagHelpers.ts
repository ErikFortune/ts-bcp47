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

export interface TagTestCase<TFROM = string, TEXPECTED = string | RegExp> {
    description: string;
    from: TFROM;
    expected?: TEXPECTED;
    invoke(): void;
}

export type TagTestCaseEntry<TTESTCASE extends TagTestCase> = [string, TTESTCASE];

export class CreateFromTagTestCase implements TagTestCase {
    public readonly description: string;
    public readonly from: string;
    public readonly options: LanguageTagInitOptions | undefined;
    public readonly expected?: string | RegExp;

    public constructor(gtc: GenericLanguageTagTest, which: TestKey) {
        this.from = gtc.from;
        this.options = optionsByKey[which];
        this.expected = gtc.expected[which];

        if (typeof this.expected === 'string') {
            this.description = `${gtc.description} "${gtc.from}" succeeds with "${this.expected}" for ${which}`;
        } else if (this.expected instanceof RegExp) {
            this.description = `${gtc.description} "${gtc.from}" fails with "${this.expected}" for ${which}`;
        } else {
            this.description = `${gtc.description} "${gtc.from}" ignored (not expected value)`;
        }
    }

    public invoke(): void {
        if (this.expected === 'string') {
            expect(LanguageTag.createFromTag(this.from, this.options)).toSucceedAndSatisfy((lt) => {
                expect(lt.tag).toEqual(this.expected);
            });
        } else if (this.expected instanceof RegExp) {
            expect(LanguageTag.createFromTag(this.from, this.options)).toFailWith(this.expected);
        }
    }
}

export class CreateFromTagTestCaseFactory {
    public static emitOne(gtc: GenericLanguageTagTest, which: TestKey): TagTestCaseEntry<CreateFromTagTestCase> | undefined {
        const tc = new CreateFromTagTestCase(gtc, which);
        return tc.expected ? [tc.description, tc] : undefined;
    }

    public static emit(which: TestKey, all: GenericLanguageTagTest[]): TagTestCaseEntry<CreateFromTagTestCase>[] {
        return all
            .map((gtc) => CreateFromTagTestCaseFactory.emitOne(gtc, which))
            .filter((tc): tc is TagTestCaseEntry<CreateFromTagTestCase> => tc !== undefined);
    }
}
