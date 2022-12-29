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

import { LanguageTag } from '../languageTag';
import { matchQuality } from './common';

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

        let quality = this.comparePrimaryLanguage(t1, t2);
        quality = quality > matchQuality.none ? Math.min(this.compareExtlang(t1, t2), quality) : quality;
        quality = quality > matchQuality.none ? Math.min(this.compareScript(t1, t2), quality) : quality;

        return quality;
    }

    public comparePrimaryLanguage(lt1: LanguageTag, lt2: LanguageTag): number {
        // istanbul ignore next
        const l1 = lt1.parts.primaryLanguage?.toLowerCase();
        // istanbul ignore next
        const l2 = lt2.parts.primaryLanguage?.toLowerCase();

        if (l1 == l2) {
            return matchQuality.exact;
        }

        if (lt1.isUndetermined || lt2.isUndetermined) {
            return matchQuality.undetermined;
        }

        return matchQuality.none;
    }

    public compareExtlang(lt1: LanguageTag, lt2: LanguageTag): number {
        if (lt1.parts.extlangs?.length !== lt2.parts.extlangs?.length) {
            return matchQuality.none;
        }

        if (lt1.parts.extlangs) {
            for (let i = 0; i < lt1.parts.extlangs.length; i++) {
                if (lt1.parts.extlangs[i].toLowerCase() !== lt2.parts.extlangs![i].toLowerCase()) {
                    return matchQuality.none;
                }
            }
        }

        return matchQuality.exact;
    }

    public compareScript(lt1: LanguageTag, lt2: LanguageTag): number {
        const s1 = lt1.effectiveScript?.toLowerCase();
        const s2 = lt2.effectiveScript?.toLowerCase();

        if (s1 === s2) {
            return matchQuality.exact;
        }

        if (lt1.isUndetermined || lt2.isUndetermined) {
            return matchQuality.undetermined;
        }

        return matchQuality.none;
    }
}
