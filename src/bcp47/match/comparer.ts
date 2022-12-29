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

import { matchQuality, undeterminedLanguage } from './common';

import { LanguageTag } from '../languageTag';

export class LanguageComparer {
    public iana: Iana.LanguageRegistries;

    public constructor(iana?: Iana.LanguageRegistries) {
        // istanbul ignore next
        this.iana = iana ?? Iana.DefaultRegistries.languageRegistries;
    }

    public compare(t1: LanguageTag, t2: LanguageTag): number {
        // no primary tag is either all private or grandfathered, which must match
        // exactly.
        if (!t1.parts.primaryLanguage || !t2.parts.primaryLanguage) {
            return t1.toString().toLowerCase() === t2.toString().toLowerCase() ? matchQuality.exact : matchQuality.none;
        }

        const quality = this.comparePrimaryLanguage(t1.parts.primaryLanguage, t2.parts.primaryLanguage);

        return quality;
    }

    public comparePrimaryLanguage(language1: Iana.LanguageSubtags.LanguageSubtag, language2: Iana.LanguageSubtags.LanguageSubtag): number {
        const l1 = language1.toLowerCase();
        const l2 = language2.toLowerCase();

        if (l1 == l2) {
            return matchQuality.exact;
        }
        if (l1 === undeterminedLanguage || l2 === undeterminedLanguage) {
            return matchQuality.undetermined;
        }
        return matchQuality.none;
    }
}
