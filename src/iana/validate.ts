/*
 * Copyright (c) 2021 Erik Fortune
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

import * as Model from './model';
import { Result, fail, succeed } from '@fgv/ts-utils';

export class WellFormed {
    public static languageSubtag(val: unknown): val is Model.LanguageSubtag {
        return typeof val === 'string' && /^[A-Za-z]{2,3}$/.test(val);
    }

    public static extLangSubtag(val: unknown): val is Model.ExtLangSubtag {
        return typeof val === 'string' && /^[A-Za-z]{3}$/.test(val);
    }

    public static scriptSubtag(val: unknown): val is Model.ScriptSubtag {
        return typeof val === 'string' && /^[A-Za-z]{4}$/.test(val);
    }

    public static isoAlpha2RegionCode(val: unknown): val is Model.IsoAlpha2RegionCode {
        return typeof val === 'string' && val.length === 2 && val.toUpperCase() === val;
    }

    public static isoAlpha3RegionCode(val: unknown): val is Model.IsoAlpha3RegionCode {
        return typeof val === 'string' && val.length === 3 && val.toUpperCase() === val;
    }

    public static unM49RegionCode(val: unknown): val is Model.UnM49RegionCode {
        return typeof val === 'string' && /^[0-9]{1,3}$/.test(val);
    }

    public static regionSubtag(val: unknown): val is Model.RegionSubtag {
        return WellFormed.isoAlpha2RegionCode(val) || WellFormed.unM49RegionCode(val) || WellFormed.isoAlpha3RegionCode(val);
    }

    public static variantSubtag(val: unknown): val is Model.VariantSubtag {
        return typeof val === 'string' && (/^[A-Za-z][A-Za-z0-9]{4,7}$/.test(val) || /^[0-9][A-Za-z0-9]{3,7}$/.test(val));
    }

    public static grandfatheredTag(val: unknown): val is Model.GrandfatheredTag {
        return typeof val === 'string' && /^[A-Za-z0-9-]+$/.test(val);
    }

    public static redundantTag(val: unknown): val is Model.RedundantTag {
        return typeof val === 'string' && /^[A-Za-z0-9-]+$/.test(val);
    }

    public static unicodeCharacterSpec(val: string): val is Model.UnicodeCharacterSpec {
        return typeof val === 'string' && /^U\+[0-9A-F]{4}$/.test(val);
    }

    public static yearMonthDaySpec(val: string): val is Model.YearMonthDaySpec {
        // TODO: should probably actually test range on days and months here
        return typeof val === 'string' && /-?[0-9]{1,4}-[0-9]{1,2}-[0-9]{1,2}/.test(val);
    }
}

type TypeGuard<T extends string> = (val: string) => val is T;
type Validator<T extends string> = (val: string) => Result<T>;

export function getValidator<T extends string>(validator: TypeGuard<T>, description: string): Validator<T> {
    return (val: string) => {
        if (validator(val)) {
            return succeed(val);
        }
        return fail(`${val}: Not a valid ${description}`);
    };
}

export const isoAlpha2RegionCode = getValidator(WellFormed.isoAlpha2RegionCode, 'ISO 3166 Alpha-2 region code');
export const isoAlpha3RegionCode = getValidator(WellFormed.isoAlpha3RegionCode, 'ISO 3166 Alpha-3 region code');
export const unM49RegionCode = getValidator(WellFormed.unM49RegionCode, 'UN M.49 region code');

export const languageSubtag = getValidator(WellFormed.languageSubtag, 'language subtag');
export const extLangSubtag = getValidator(WellFormed.extLangSubtag, 'extlang subtag');
export const scriptSubtag = getValidator(WellFormed.scriptSubtag, 'script subtag');
export const regionSubtag = getValidator(WellFormed.regionSubtag, 'region subtag');
export const variantSubtag = getValidator(WellFormed.variantSubtag, 'variant subtag');

export const grandfatheredTag = getValidator(WellFormed.grandfatheredTag, 'grandfathered tag');
export const redundantTag = getValidator(WellFormed.redundantTag, 'redundant tag');

export const unicodeCharacterSpec = getValidator(WellFormed.unicodeCharacterSpec, 'Unicode character specification');

export const yearMonthDaySpec = getValidator(WellFormed.yearMonthDaySpec, 'year-month-day specification');
