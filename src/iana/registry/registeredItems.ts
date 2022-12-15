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

import * as Model from './model';

import {
    ExtLangSubtag,
    ExtendedLanguageRange,
    GrandfatheredTag,
    LanguageSubtag,
    RedundantTag,
    RegionSubtag,
    ScriptSubtag,
    VariantSubtag,
} from '../tags';

export interface RegisteredLanguage {
    readonly type: 'language';
    readonly subtag: LanguageSubtag;
    readonly description: string[];
    readonly added: Model.YearMonthDaySpec;

    readonly comments?: string[];
    readonly deprecated?: Model.YearMonthDaySpec;

    readonly macrolanguage?: LanguageSubtag;
    readonly preferredValue?: LanguageSubtag;
    readonly scope?: Model.RegistryEntryScope;
    readonly suppressScript?: ScriptSubtag;
}

export interface RegisteredExtLang {
    readonly type: 'extlang';
    readonly subtag: ExtLangSubtag;
    readonly preferredValue: ExtendedLanguageRange;
    readonly prefix: LanguageSubtag;
    readonly description: string[];
    readonly added: Model.YearMonthDaySpec;

    readonly comments?: string[];
    readonly deprecated?: Model.YearMonthDaySpec;

    readonly macrolanguage?: LanguageSubtag;
    readonly scope?: Model.RegistryEntryScope;
    readonly suppressScript?: ScriptSubtag;
}

export interface RegisteredScript {
    readonly type: 'script';
    readonly subtag: ScriptSubtag;
    readonly description: string[];
    readonly added: Model.YearMonthDaySpec;

    readonly comments?: string[];
    readonly deprecated?: Model.YearMonthDaySpec;
    readonly preferredValue?: ScriptSubtag;
}

export interface RegisteredRegion {
    readonly type: 'region';
    readonly subtag: RegionSubtag;
    readonly description: string[];
    readonly added: Model.YearMonthDaySpec;

    readonly comments?: string[];
    readonly deprecated?: Model.YearMonthDaySpec;
    readonly preferredValue?: RegionSubtag;
}

export interface RegisteredVariant {
    readonly type: 'variant';
    readonly subtag: VariantSubtag;
    readonly description: string[];
    readonly added: Model.YearMonthDaySpec;

    readonly comments?: string[];
    readonly deprecated?: Model.YearMonthDaySpec;
    readonly preferredValue?: VariantSubtag;
    readonly prefix?: ExtendedLanguageRange[];
}

export interface RegisteredGrandfatheredTag {
    readonly type: 'grandfathered';
    readonly tag: GrandfatheredTag;
    readonly description: string[];
    readonly added: Model.YearMonthDaySpec;

    readonly comments?: string[];
    readonly deprecated?: Model.YearMonthDaySpec;
    readonly preferredValue?: ExtendedLanguageRange;
}

export interface RegisteredRedundantTag {
    readonly type: 'redundant';
    readonly tag: RedundantTag;
    readonly description: string[];
    readonly added: Model.YearMonthDaySpec;

    readonly comments?: string[];
    readonly deprecated?: Model.YearMonthDaySpec;
    readonly preferredValue?: ExtendedLanguageRange;
}

export type RegisteredItem =
    | RegisteredLanguage
    | RegisteredExtLang
    | RegisteredScript
    | RegisteredRegion
    | RegisteredVariant
    | RegisteredGrandfatheredTag
    | RegisteredRedundantTag;
