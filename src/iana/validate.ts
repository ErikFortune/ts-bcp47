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
import * as Tags from './tags';
import {
    ExtLangSubtag,
    GrandfatheredTag,
    IsoAlpha2RegionCode,
    IsoAlpha3RegionCode,
    LanguageSubtag,
    RedundantTag,
    RegionSubtag,
    ScriptSubtag,
    UnM49RegionCode,
    UnicodeCharacterSpec,
    VariantSubtag,
    YearMonthDaySpec,
} from './common';
import { Result, fail, succeed } from '@fgv/ts-utils';

export class WellFormed {
    public static languageSubtag(val: unknown): val is LanguageSubtag {
        return typeof val === 'string' && Tags.Language.wellFormed.test(val);
    }

    public static extLangSubtag(val: unknown): val is ExtLangSubtag {
        return typeof val === 'string' && Tags.ExtLang.wellFormed.test(val);
    }

    public static scriptSubtag(val: unknown): val is ScriptSubtag {
        return typeof val === 'string' && Tags.Script.wellFormed.test(val);
    }

    public static isoAlpha2RegionCode(val: unknown): val is IsoAlpha2RegionCode {
        return typeof val === 'string' && val.length === 2 && Tags.Region.wellFormedAlpha2.test(val);
    }

    public static isoAlpha3RegionCode(val: unknown): val is IsoAlpha3RegionCode {
        return typeof val === 'string' && val.length === 3 && Tags.Region.canonicalAlpha3.test(val);
    }

    public static unM49RegionCode(val: unknown): val is UnM49RegionCode {
        return typeof val === 'string' && val.length === 3 && Tags.Region.wellFormedUnM49.test(val);
    }

    public static regionSubtag(val: unknown): val is RegionSubtag {
        return typeof val === 'string' && Tags.Region.wellFormed.test(val);
    }

    public static variantSubtag(val: unknown): val is VariantSubtag {
        return typeof val === 'string' && Tags.Variant.wellFormed.test(val);
    }

    public static grandfatheredTag(val: unknown): val is GrandfatheredTag {
        return typeof val === 'string' && Tags.Grandfathered.wellFormed.test(val);
    }

    public static redundantTag(val: unknown): val is RedundantTag {
        return typeof val === 'string' && Tags.Redundant.wellFormed.test(val);
    }

    public static unicodeCharacterSpec(val: string): val is UnicodeCharacterSpec {
        return typeof val === 'string' && /^U\+[0-9A-F]{4}$/.test(val);
    }

    public static yearMonthDaySpec(val: string): val is YearMonthDaySpec {
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
