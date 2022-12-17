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
import * as Bcp from '../../../src/bcp';
import * as Iana from '../../../src/iana';

describe('BCP-47 languageTag class', () => {
    const iana = Iana.TagRegistry.load('node_modules/language-subtag-registry/data/json').getValueOrThrow();

    describe('parse static method', () => {
        test.each([
            ['canonical alpha-2 language', 'en', { primaryLanguage: 'en' }],
            ['canonical alpha-3 language', 'deu', { primaryLanguage: 'deu' }],
            ['canonical language with extlang', 'zh-cmn', { primaryLanguage: 'zh', extlangs: ['cmn'] }],
            ['canonical language with two extlang', 'zh-cmn-han', { primaryLanguage: 'zh', extlangs: ['cmn', 'han'] }],
            ['canonical language with script', 'cmn-Hant', { primaryLanguage: 'cmn', script: 'Hant' }],
            ['canonical language with variant', 'de-1996', { primaryLanguage: 'de', variants: ['1996'] }],
            ['canonical language with multiple variants', 'sl-rozaj-lipaw', { primaryLanguage: 'sl', variants: ['rozaj', 'lipaw'] }],
            ['canonical language with extlang and script', 'zh-cmn-Hant', { primaryLanguage: 'zh', extlangs: ['cmn'], script: 'Hant' }],
            ['canonical language with script and region', 'cmn-Hant-CN', { primaryLanguage: 'cmn', script: 'Hant', region: 'CN' }],
            ['canonical language with region', 'en-US', { primaryLanguage: 'en', region: 'US' }],
            ['canonical language with numeric region', 'es-419', { primaryLanguage: 'es', region: '419' }],
            ['grandfathered tag', 'i-klingon', { grandfathered: 'i-klingon' }],
        ])('succeeds for %p (%p)', (_desc, tag, expected) => {
            expect(Bcp.LanguageTag.parse(tag, iana)).toSucceedWith(expected as Bcp.LanguageTagParts);
        });

        test.each([
            ['no primary language', 'Latn', /no primary language/i],
            ['unknown grandfathered tag', 'i-dothraki', /unrecognized grandfathered/i],
            ['too many extlang', 'zh-cmn-han-yue-abc', /too many extlang/i],
            ['extra subtags', 'en-US-US', /unexpected subtag/i],
        ])('fails for %p (%p)', (_desc, tag, expected) => {
            expect(Bcp.LanguageTag.parse(tag, iana)).toFailWith(expected);
        });
    });
});
