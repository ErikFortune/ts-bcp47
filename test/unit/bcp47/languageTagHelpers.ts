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
import { LanguageTagInitOptions } from '../../../src/bcp47/languageTag';

interface GenericLanguageTagTestExpected<TEXPECTED = string | RegExp> {
    default?: TEXPECTED;
    wellFormed?: TEXPECTED;
    wellFormedCanonical?: TEXPECTED;
    valid?: TEXPECTED;
    validCanonical?: TEXPECTED;
    preferred?: TEXPECTED;
    strictlyValid?: TEXPECTED;
    strictlyValidCanonical?: TEXPECTED;
    strictlyValidPreferred?: TEXPECTED;
}

export type TestKey = keyof GenericLanguageTagTestExpected;
export const allTestKeys: TestKey[] = [
    'default',
    'wellFormed',
    'wellFormedCanonical',
    'valid',
    'validCanonical',
    'preferred',
    'strictlyValid',
    'strictlyValidCanonical',
    'strictlyValidPreferred',
];

export const allNonCanonicalTestKeys: TestKey[] = ['default', 'wellFormed', 'valid', 'strictlyValid'];
export const allCanonicalTestKeys: TestKey[] = [
    'wellFormedCanonical',
    'validCanonical',
    'preferred',
    'strictlyValidCanonical',
    'strictlyValidPreferred',
];
export const allNonPreferredCanonicalKeys: TestKey[] = ['wellFormedCanonical', 'validCanonical', 'strictlyValidCanonical'];
export const allPreferredKeys: TestKey[] = ['preferred', 'strictlyValidPreferred'];
export const allValidatingKeys: TestKey[] = [
    'valid',
    'validCanonical',
    'strictlyValid',
    'strictlyValidCanonical',
    'strictlyValidPreferred',
    'preferred',
];
export interface GenericLanguageTagTestInit<TFROM, TEXPECTED = string | RegExp> {
    description: string;
    from: TFROM;
    expected: [TEXPECTED | undefined, TestKey[]][];
}

export class GenericLanguageTagTest<TFROM, TEXPECTED = string | RegExp> {
    public readonly description: string;
    public readonly from: TFROM;
    public readonly expected: GenericLanguageTagTestExpected<TEXPECTED>;
    public constructor(init: GenericLanguageTagTestInit<TFROM, TEXPECTED>) {
        this.description = init.description;
        this.from = init.from;

        this.expected = {};
        for (const value of init.expected) {
            for (const key of value[1]) {
                this.expected[key] = value[0];
            }
        }
    }

    public static mapInitToTestCases<TFROM, TEXPECTED = string | RegExp>(
        init: GenericLanguageTagTestInit<TFROM, TEXPECTED>
    ): GenericLanguageTagTest<TFROM, TEXPECTED> {
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

export interface TagTestCase<TFROM, TEXPECTED = string | RegExp> {
    description: string;
    from: TFROM;
    expected?: TEXPECTED;
    invoke(): void;
}

export type TagTestCaseEntry<TFROM, TTESTCASE extends TagTestCase<TFROM>> = [string, TTESTCASE];

export abstract class TagTestCaseFactoryBase<TFROM, TTESTCASE extends TagTestCase<TFROM>> {
    public emitOne(gtc: GenericLanguageTagTest<TFROM>, which: TestKey): TagTestCaseEntry<TFROM, TTESTCASE> | undefined {
        const tc = this._construct(gtc, which);
        return tc.expected ? [tc.description, tc] : undefined;
    }

    public emit(which: TestKey, all: GenericLanguageTagTest<TFROM>[]): TagTestCaseEntry<TFROM, TTESTCASE>[] {
        return all.map((gtc) => this.emitOne(gtc, which)).filter((tc): tc is TagTestCaseEntry<TFROM, TTESTCASE> => tc !== undefined);
    }

    protected abstract _construct(gtc: GenericLanguageTagTest<TFROM>, which: TestKey): TTESTCASE;
}

export class GenericTagTestCaseFactory<TFROM, TTESTCASE extends TagTestCase<TFROM>> extends TagTestCaseFactoryBase<TFROM, TTESTCASE> {
    protected _construct: (gtc: GenericLanguageTagTest<TFROM>, which: TestKey) => TTESTCASE;

    public constructor(construct: (gtc: GenericLanguageTagTest<TFROM>, which: TestKey) => TTESTCASE) {
        super();
        this._construct = construct;
    }
}

export abstract class SimpleTagTestCaseBase<TFROM> implements TagTestCase<TFROM> {
    public readonly description: string;
    public readonly from: TFROM;
    public readonly options: LanguageTagInitOptions | undefined;
    public readonly expected?: string | RegExp;

    public constructor(gtc: GenericLanguageTagTest<TFROM>, which: TestKey) {
        this.from = gtc.from;
        this.options = optionsByKey[which];
        this.expected = gtc.expected[which];

        const fromDesc = typeof gtc.from === 'string' ? gtc.from : JSON.stringify(gtc.from, undefined, 2);
        if (typeof this.expected === 'string') {
            this.description = `${which} succeeds for "${fromDesc}" with "${this.expected}" (${gtc.description})`;
        } else if (this.expected instanceof RegExp) {
            this.description = `${which} fails for "${fromDesc}" with "${this.expected}" (${gtc.description})`;
        } else {
            this.description = `${gtc.description} "${fromDesc}" ignored due to expected value {${gtc.description}})`;
        }
    }

    public abstract invoke(): void;
}
