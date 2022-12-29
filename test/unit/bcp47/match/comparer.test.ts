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

import '@fgv/ts-utils-jest';
import { LanguageComparer, matchQuality } from '../../../../src/bcp47/match';
import { LanguageTag } from '../../../../src/bcp47/languageTag';

describe('LanguageComparer class', () => {
    describe('compare method', () => {
        const comparer = new LanguageComparer();

        test.each([
            { description: 'exact primary language match', l1: 'en', l2: 'En', expected: matchQuality.exact },
            { description: 'undetermined primary language match', l1: 'und', l2: 'En', expected: matchQuality.undetermined },
            { description: 'extlang match', l1: 'zh-cmn', l2: 'zh-Cmn', expected: matchQuality.exact },
            { description: 'extlang and no extlang do not match', l1: 'zh', l2: 'zh-cmn', expected: matchQuality.none },
            { description: 'extlang mismatch', l1: 'zh-Cmn', l2: 'zh-yue', expected: matchQuality.none },
            { description: 'extlang length mismatch', l1: 'zh-cmn-yue', l2: 'zh-cmn', expected: matchQuality.none },
            { description: 'exact language and script match', l1: 'zh-hans', l2: 'zh-Hans', expected: matchQuality.exact },
            { description: 'language and suppressed script match', l1: 'en', l2: 'en-latn', expected: matchQuality.exact },
            { description: 'invalid language has no suppressed script', l1: 'zzz-Latn', l2: 'zzz', expected: matchQuality.none },
            { description: 'script mismatch', l1: 'zh-hans', l2: 'zh-hant', expected: matchQuality.none },
            { description: 'suppressed script mismatch', l1: 'en-Cyrl', l2: 'en', expected: matchQuality.none },
            { description: 'undetermined matches any script', l1: 'und', l2: 'zh-hans', expected: matchQuality.undetermined },
            {
                description: 'undetermined with script matches that script',
                l1: 'und-hans',
                l2: 'zh-hans',
                expected: matchQuality.undetermined,
            },
            {
                description: 'undetermined with script does not match other scripts',
                l1: 'und-hant',
                l2: 'zh-hans',
                expected: matchQuality.undetermined,
            },
            { description: 'region matches', l1: 'en-US', l2: 'en-us', expected: matchQuality.exact },
            { description: 'region is partial match with neutral', l1: 'en-US', l2: 'en', expected: matchQuality.neutralRegion },
            { description: 'region is partial match with global', l1: 'en-US', l2: 'en-001', expected: matchQuality.neutralRegion },
            { description: 'global is exact match with region neutral', l1: 'en', l2: 'en-001', expected: matchQuality.exact },
            { description: 'region mismatch', l1: 'en-US', l2: 'en-GB', expected: matchQuality.none },
            { description: 'exact private tag match', l1: 'x-some-tag', l2: 'x-Some-Tag', expected: matchQuality.exact },
            { description: 'exact valid grandfathered tag match', l1: 'i-klingon', l2: 'i-Klingon', expected: matchQuality.exact },
            { description: 'non-matching primary language', l1: 'en', l2: 'fr', expected: matchQuality.none },
            { description: 'non-matching private tags', l1: 'x-some-tag', l2: 'x-some-other-tag', expected: matchQuality.none },
            { description: 'private and non-private do not match', l1: 'x-en-US', l2: 'en-US', expected: matchQuality.none },
        ])('yields $expected for $l1/$l2 ($description)', (tc) => {
            const t1 = LanguageTag.create(tc.l1).getValueOrThrow();
            const t2 = LanguageTag.create(tc.l2).getValueOrThrow();
            expect(comparer.compare(t1, t2)).toEqual(tc.expected);
        });
    });
});