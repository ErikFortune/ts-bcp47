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

import * as Iana from '../iana';
import * as Parser from './transforms/languageTagParser';

import { LanguageTagParts, languageTagPartsToString } from './common';
import { Result, fail, succeed } from '@fgv/ts-utils';
import { WellFormedTagValidator } from './transforms/wellFormedValidator';

export class WellFormedTag {
    public readonly parts: Readonly<LanguageTagParts>;

    protected constructor(init: Readonly<LanguageTagParts>) {
        this.parts = Object.freeze({ ...init });
    }

    public get tag(): string {
        return languageTagPartsToString(this.parts);
    }

    public static create(tag: string, iana: Iana.LanguageRegistries): Result<WellFormedTag>;
    public static create(parts: LanguageTagParts, iana: Iana.LanguageRegistries): Result<WellFormedTag>;
    public static create(tagOrParts: string | LanguageTagParts, iana: Iana.LanguageRegistries): Result<WellFormedTag> {
        let parts = typeof tagOrParts === 'object' ? tagOrParts : undefined;
        if (parts === undefined) {
            const parsed = Parser.LanguageTagParser.parse(tagOrParts as string, iana);
            if (parsed.isFailure()) {
                return fail(`${tagOrParts}: malformed language tag ("${parsed.message}")`);
            }
            parts = parsed.value;
        }

        const validator = new WellFormedTagValidator(iana);
        return validator.process(parts).onSuccess((parts) => {
            return succeed(new WellFormedTag(parts));
        });
    }

    public toString(): string {
        return this.tag;
    }
}
