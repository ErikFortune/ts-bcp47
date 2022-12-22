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

import {
    ExtLangSubtag,
    ExtendedLanguageRange,
    GrandfatheredTag,
    LanguageSubtag,
    RedundantTag,
    RegionSubtag,
    ScriptSubtag,
    VariantSubtag,
} from './model';
import { getValidatingMapper } from '../../../../utils/validatingMapper';

export class WellFormed {
    public static readonly languageSubtagRegexp = /^[A-Za-z]{2,3}$/;

    public static languageSubtag(val: unknown): val is LanguageSubtag {
        return typeof val === 'string' && this.languageSubtagRegexp.test(val);
    }

    public static extLangSubtag(val: unknown): val is ExtLangSubtag {
        return typeof val === 'string' && Tags.ExtLang.wellFormed.test(val);
    }

    public static scriptSubtag(val: unknown): val is ScriptSubtag {
        return typeof val === 'string' && Tags.Script.wellFormed.test(val);
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

    public static extendedLanguageRange(val: unknown): val is ExtendedLanguageRange {
        return typeof val === 'string' && Tags.Redundant.wellFormed.test(val);
    }
}

export const isoAlpha2RegionCode = getValidatingMapper(WellFormed.isoAlpha2RegionCode, 'ISO 3166 Alpha-2 region code');
export const isoAlpha3RegionCode = getValidatingMapper(WellFormed.isoAlpha3RegionCode, 'ISO 3166 Alpha-3 region code');
export const unM49RegionCode = getValidatingMapper(WellFormed.unM49RegionCode, 'UN M.49 region code');

export const languageSubtag = getValidatingMapper(WellFormed.languageSubtag, 'language subtag');
export const extLangSubtag = getValidatingMapper(WellFormed.extLangSubtag, 'extlang subtag');
export const scriptSubtag = getValidatingMapper(WellFormed.scriptSubtag, 'script subtag');
export const regionSubtag = getValidatingMapper(WellFormed.regionSubtag, 'region subtag');
export const variantSubtag = getValidatingMapper(WellFormed.variantSubtag, 'variant subtag');

export const grandfatheredTag = getValidatingMapper(WellFormed.grandfatheredTag, 'grandfathered tag');
export const redundantTag = getValidatingMapper(WellFormed.redundantTag, 'redundant tag');

export const extendedLanguageRange = getValidatingMapper(WellFormed.extendedLanguageRange, 'extended language range');
