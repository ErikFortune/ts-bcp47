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

import { LanguageTagParts, languageTagPartsToString } from './common';
import { Result, captureResult, fail, succeed } from '@fgv/ts-utils';

import { ValidTag } from './validTag';

export class PreferredTag {
    public readonly from: ValidTag;
    public readonly parts: LanguageTagParts;

    protected constructor(from: ValidTag, iana: Iana.IanaRegistries) {
        this.from = from;

        const grandfathered = this._checkGrandfathered(from.parts, iana).getValueOrThrow();

        this.parts = Object.freeze(grandfathered ?? { ...from.parts });
    }

    public static create(tag: string, iana: Iana.IanaRegistries): Result<PreferredTag>;
    public static create(from: ValidTag, iana: Iana.IanaRegistries): Result<PreferredTag>;
    public static create(from: string | ValidTag, iana: Iana.IanaRegistries): Result<PreferredTag> {
        if (typeof from === 'string') {
            const valid = ValidTag.create(from, iana);
            if (valid.isFailure()) {
                return fail(`invalid language tag "${from}"`);
            }
            from = valid.value;
        }
        return captureResult(() => {
            return new PreferredTag(from as ValidTag, iana);
        });
    }

    public toString(): string {
        return languageTagPartsToString(this.parts);
    }

    protected _checkGrandfathered(parts: LanguageTagParts, iana: Iana.IanaRegistries): Result<LanguageTagParts | undefined> {
        if (parts.grandfathered) {
            const grandfathered = iana.subtags.grandfathered.tryGet(parts.grandfathered);
            if (!grandfathered) {
                return fail(`invalid grandfathered tag "${parts.grandfathered}"`);
            }
            if (grandfathered.preferredValue) {
                const preferred = ValidTag.create(grandfathered.preferredValue, iana);
                if (preferred.isFailure()) {
                    return fail(
                        `grandfathered tag "${parts.grandfathered}" has invalid preferred value "${grandfathered.preferredValue}: ${preferred.message}.`
                    );
                }
                return succeed(preferred.value.parts);
            }
        }
        return succeed(undefined);
    }
}
