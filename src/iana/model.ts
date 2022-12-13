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

import { Brand } from '@fgv/ts-utils';

export type IsoAlpha2RegionCode = Brand<string, 'IsoAlpha2RegionCode'>;
export type IsoAlpha3RegionCode = Brand<string, 'IsoAlpha3RegionCode'>;
export type UnM49RegionCode = Brand<string, 'UnM49RegionCode'>;

export type LanguageSubtag = Brand<string, 'LanguageSubtag'>;
export type ExtLangSubtag = Brand<string, 'ExtLangSubtag'>;
export type ScriptSubtag = Brand<string, 'ScriptSubtag'>;
export type RegionSubtag = Brand<string, 'RegionSubtag'>;
export type VariantSubtag = Brand<string, 'VariantSubtag'>;
export type GrandfatheredTag = Brand<string, 'GrandfatheredTag'>;
export type RedundantTag = Brand<string, 'RedundantTag'>;

export type UnicodeCharacterSpec = Brand<string, 'UnicodeCharSpec'>;
export type YearMonthDaySpec = Brand<string, 'YearMonthDaySpec'>;

export type RegistryEntryType = 'extlang' | 'grandfathered' | 'language' | 'redundant' | 'region' | 'script' | 'variant';
export const allRegistryEntryTypes: RegistryEntryType[] = [
    'extlang',
    'grandfathered',
    'language',
    'redundant',
    'region',
    'script',
    'variant',
];

export type RegistryEntryScope = 'collection' | 'macrolanguage' | 'private-use' | 'special';
export const allRegistryEntryScopes: RegistryEntryScope[] = ['collection', 'macrolanguage', 'private-use', 'special'];

interface RegistryEntryBase<TTYPE extends RegistryEntryType = RegistryEntryType> {
    /* eslint-disable @typescript-eslint/naming-convention */
    Type: TTYPE;
    Description: string[];
    Added: YearMonthDaySpec;
    Deprecated?: YearMonthDaySpec;
    'Suppress-Script'?: ScriptSubtag;
    Macrolanguage?: LanguageSubtag;
    'Preferred-Value'?: string;
    Prefix?: string[];
    Scope?: RegistryEntryScope;
    Comments?: string[];
    /* eslint-enable @typescript-eslint/naming-convention */
}

export interface RegistrySubtagEntry<TTYPE extends RegistryEntryType = RegistryEntryType, TSUBTAG extends string = string>
    extends RegistryEntryBase<TTYPE> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Subtag: TSUBTAG;
}

export interface RegistryTagEntry<TTYPE extends RegistryEntryType = RegistryEntryType, TTAG extends string = string>
    extends RegistryEntryBase<TTYPE> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Tag: TTAG;
}

export type LanguageSubtagRegistryEntry = RegistrySubtagEntry<'language', LanguageSubtag>;
export type ExtLangSubtagRegistryEntry = RegistrySubtagEntry<'extlang', ExtLangSubtag>;
export type RegionSubtagRegistryEntry = RegistrySubtagEntry<'region', RegionSubtag>;
export type ScriptSubtagRegistryEntry = RegistrySubtagEntry<'script', ScriptSubtag>;
export type VariantSubtagRegistryEntry = RegistrySubtagEntry<'variant', VariantSubtag>;
export type GrandfatheredTagRegistryEntry = RegistryTagEntry<'grandfathered', GrandfatheredTag>;
export type RedundantTagRegistryEntry = RegistryTagEntry<'redundant', RedundantTag>;
export type RegistryEntry =
    | LanguageSubtagRegistryEntry
    | ExtLangSubtagRegistryEntry
    | RegionSubtagRegistryEntry
    | ScriptSubtagRegistryEntry
    | VariantSubtagRegistryEntry
    | GrandfatheredTagRegistryEntry
    | RedundantTagRegistryEntry;

export type RegistryScope<TSUBTAG extends string = string> = Record<TSUBTAG, number>;
