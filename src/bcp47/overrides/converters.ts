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

import * as Iana from '../../iana';
import * as Model from './model';

import { Converters, Result } from '@fgv/ts-utils';
import { convertJsonFileSync } from '@fgv/ts-json/file';

export const languageOverrideRecord = Converters.strictObject<Model.LanguageOverrideRecord>(
    {
        language: Iana.LanguageSubtags.Converters.Tags.languageSubtag,
        preferredRegion: Iana.LanguageSubtags.Converters.Tags.regionSubtag,
        defaultAffinity: Converters.string,
        affinity: Converters.recordOf(Converters.arrayOf(Iana.LanguageSubtags.Converters.Tags.regionSubtag)),
    },
    { optionalFields: ['affinity', 'defaultAffinity', 'preferredRegion'] }
);

export const languageOverridesFile = Converters.arrayOf(languageOverrideRecord);

export function loadLanguageOverridesFileSync(path: string): Result<Model.LanguageOverrideRecord[]> {
    return convertJsonFileSync(path, languageOverridesFile);
}
