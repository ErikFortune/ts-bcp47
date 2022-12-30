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
import { LanguageTag, LanguageTagInitOptions } from '../../../../src/bcp47/languageTag';

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
            { description: 'macro-region match with area is partial', l1: 'es-419', l2: 'es-AR', expected: matchQuality.macroRegion },
            {
                description: 'macro-region match with area order is irrelevant',
                l1: 'es-AR',
                l2: 'es-419',
                expected: matchQuality.macroRegion,
            },
            { description: 'macro-region match with region is partial', l1: 'es-019', l2: 'es-419', expected: matchQuality.macroRegion },
            {
                description: 'macro-region match with region order is irrelevant',
                l1: 'es-419',
                l2: 'es-019',
                expected: matchQuality.macroRegion,
            },
            { description: 'region mismatch is partial', l1: 'en-US', l2: 'en-GB', expected: matchQuality.sibling },
            { description: 'variants match is exact', l1: 'ca-valencia', l2: 'ca-Valencia', expected: matchQuality.exact },
            { description: 'variant is partial match with no variant', l1: 'ca-valencia', l2: 'ca', expected: matchQuality.region },
            { description: 'variant mismatch is partial match', l1: 'ca-valencia', l2: 'ca-variant', expected: matchQuality.region },
            {
                description: 'variant partial match with no variant does not override region',
                l1: 'ca-valencia',
                l2: 'ca-ES',
                expected: matchQuality.neutralRegion,
            },
            { description: 'extension exact match is exact', l1: 'en-US-u-GB', l2: 'en-US-u-GB', expected: matchQuality.exact },
            { description: 'extension singleton mismatch is partial', l1: 'en-US-u-GB', l2: 'en-US-t-GB', expected: matchQuality.variant },
            { description: 'extension value mismatch is partial', l1: 'en-US-u-GB', l2: 'en-US-u-CA', expected: matchQuality.variant },
            { description: 'extension count mismatch is partial', l1: 'en-US-u-GB-t-MT', l2: 'en-US-u-gb', expected: matchQuality.variant },
            { description: 'extension mismatch is partial', l1: 'en-US-u-GB', l2: 'en-US-t-MT', expected: matchQuality.variant },
            { description: 'private tag match is exact', l1: 'en-US-x-some-tag', l2: 'en-US-x-some-tag', expected: matchQuality.exact },
            { description: 'extra private tag is partial', l1: 'en-US', l2: 'en-US-x-some-tag', expected: matchQuality.variant },
            { description: 'private tag mismatch is partial', l1: 'en-US-x-tag1', l2: 'en-US-x-tag2', expected: matchQuality.variant },
            { description: 'exact full private tag match', l1: 'x-some-tag', l2: 'x-Some-Tag', expected: matchQuality.exact },
            { description: 'exact valid grandfathered tag match', l1: 'i-klingon', l2: 'i-Klingon', expected: matchQuality.exact },
            { description: 'non-matching primary language', l1: 'en', l2: 'fr', expected: matchQuality.none },
            { description: 'non-matching private tags', l1: 'x-some-tag', l2: 'x-some-other-tag', expected: matchQuality.none },
            { description: 'private and non-private do not match', l1: 'x-en-US', l2: 'en-US', expected: matchQuality.none },
            {
                description: 'does not match preferred form of language if preferred normalization is not specified',
                l1: 'id',
                l2: 'in',
                expected: matchQuality.none,
            },
            {
                description: 'matches preferred form of language if preferred normalization specified',
                l1: 'id',
                l2: 'in',
                expected: matchQuality.exact,
                options: { normalization: 'preferred' } as LanguageTagInitOptions,
            },
            {
                description: 'does not match preferred form of region if preferred normalization is not specified',
                l1: 'en-BU',
                l2: 'en-MM',
                expected: matchQuality.sibling,
            },
            {
                description: 'matches preferred form of region if preferred normalization specified',
                l1: 'en-BU',
                l2: 'en-MM',
                expected: matchQuality.exact,
                options: { normalization: 'preferred' } as LanguageTagInitOptions,
            },
            {
                description: 'does not match preferred form of grandfathered tag if preferred normalization is not specified',
                l1: 'i-klingon',
                l2: 'tlh',
                expected: matchQuality.none,
            },
            {
                description: 'matches preferred form of grandfathered tag if preferred normalization specified',
                l1: 'i-klingon',
                l2: 'tlh',
                expected: matchQuality.exact,
                options: { normalization: 'preferred' } as LanguageTagInitOptions,
            },
        ])('"$l1"/"$l2" yields $expected ($description)', (tc) => {
            const lt1 = LanguageTag.create(tc.l1, tc.options).getValueOrThrow();
            const lt2 = LanguageTag.create(tc.l2, tc.options).getValueOrThrow();

            expect(comparer.compare(lt1, lt2)).toSucceedWith(tc.expected);
            expect(comparer.compare(tc.l1, tc.l2, tc.options)).toSucceedWith(tc.expected);
        });
    });
});
