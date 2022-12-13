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
