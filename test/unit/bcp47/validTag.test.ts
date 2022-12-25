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

import { Bcp, Iana } from '../../../src';
import { LanguageTagParts } from '../../../src/bcp47';

describe('ValidTag class', () => {
    const iana = Iana.IanaRegistries.load('data/iana').getValueOrThrow();

    describe('create static method', () => {
        test.each([
            ['valid canonical primary language', 'en', { primaryLanguage: 'en' }],
            ['valid primary language', 'EN', { primaryLanguage: 'en' }],
            ['valid canonical extlang', 'zh-cmn', { primaryLanguage: 'zh', extlangs: ['cmn'] }],
            ['valid extlang', 'ZH-Yue', { primaryLanguage: 'zh', extlangs: ['yue'] }],
            // ['private use primary language', { primaryLanguage: 'qpn' }, { primaryLanguage: 'qpn' }],
            ['valid script', 'en-LATN', { primaryLanguage: 'en', script: 'Latn' }],
            // ['private use script', { script: 'Qabc' }, { script: 'Qabc' }],
            ['valid iso3166 region', 'en-aq', { primaryLanguage: 'en', region: 'AQ' }],
            ['valid UN M.49 region', 'es-419', { primaryLanguage: 'es', region: '419' }],
            // ['private use region', { region: 'QX' }, { region: 'QX' }],
            ['valid variant', 'ca-ES-valencia', { primaryLanguage: 'ca', region: 'ES', variants: ['valencia'] }],
            ['valid variants', 'sl-rozaj-lipaw', { primaryLanguage: 'sl', variants: ['rozaj', 'lipaw'] }],
            [
                'valid extensions',
                'en-US-u-en-US-t-MT',
                {
                    primaryLanguage: 'en',
                    region: 'US',
                    extensions: [
                        { singleton: 'u', value: 'en-US' },
                        { singleton: 't', value: 'mt' },
                    ],
                },
            ],
            ['valid private-use subtag', 'en-x-Pig-Latin', { primaryLanguage: 'en', privateUse: ['pig-latin'] }],
            ['valid i- grandfathered tag', 'i-ami', { grandfathered: 'i-ami' }],
            ['valid other grandfathered tag', 'en-GB-oed', { grandfathered: 'en-GB-oed' }],
        ])('succeeds for %p', (_desc, tag, expected) => {
            expect(Bcp.ValidTag.create(tag, iana)).toSucceedAndSatisfy((valid) => {
                expect(valid.parts).toEqual(expected);
            });
        });

        test.each([
            ['invalid primary language', 'ENG', /invalid language/i],
            ['invalid extlang', 'zh-han', /invalid extlang/i],
            ['multiple extlang', 'zh-cmn-yue', /multiple extlang/i],
            ['invalid script', 'en-Aaaa', /invalid script/i],
            ['invalid region', 'es-AJ', /invalid region/i],
            ['invalid variant', 'en-US-xyzzy', /invalid variant/i],
            ['duplicate variants', 'ca-ES-valencia-valencia', /duplicate variant/i],
            ['invalid extension', 'en-US-a-extend', /invalid.*extension/i],
            ['duplicate extension', 'en-US-u-US-u-GB', /duplicate extension/i],
        ])('fails for %p', (_desc, tag, expected) => {
            expect(Bcp.ValidTag.create(tag, iana)).toFailWith(expected);
        });
    });

    describe('validateExtlangPrefix static method', () => {
        test.each([['valid extlang prefix', { primaryLanguage: 'zh', extlangs: ['cmn'] }]])('succeeds for %p', (_desc, value) => {
            const parts = value as LanguageTagParts;
            expect(Bcp.ValidTag.validateExtlangPrefix(parts, iana)).toSucceed();
        });

        test.each([
            ['missing primary language', { extlangs: ['cmn', 'yue'] }, /missing primary language/i],
            ['multiple extlang', { primaryLanguage: 'zh', extlangs: ['cmn', 'yue'] }, /multiple extlang/i],
            ['unknown extlang', { primaryLanguage: 'zh', extlangs: ['han'] }, /invalid extlang subtag/i],
            ['non-canonical extlang', { primaryLanguage: 'zh', extlangs: ['Yue'] }, /invalid extlang subtag/i],
            ['non-canonical prefix', { primaryLanguage: 'ZH', extlangs: ['yue'] }, /invalid prefix/i],
            ['invalid prefix', { primaryLanguage: 'en', extlangs: ['cmn'] }, /invalid prefix/i],
        ])('fails for %p', (_desc, value, expected) => {
            const parts = value as LanguageTagParts;
            expect(Bcp.ValidTag.validateExtlangPrefix(parts, iana)).toFailWith(expected);
        });
    });

    describe('validateParts static method', () => {
        test.each([
            ['valid canonical primary language', { primaryLanguage: 'en' }, { primaryLanguage: 'en' }],
            ['valid primary language', { primaryLanguage: 'EN' }, { primaryLanguage: 'en' }],
            ['valid canonical extlang', { primaryLanguage: 'zh', extlangs: ['yue'] }, { primaryLanguage: 'zh', extlangs: ['yue'] }],
            ['valid extlang', { primaryLanguage: 'zh', extlangs: ['Cmn'] }, { primaryLanguage: 'zh', extlangs: ['cmn'] }],
            // ['private use primary language', { primaryLanguage: 'qpn' }, { primaryLanguage: 'qpn' }],
            ['valid script', { primaryLanguage: 'fr', script: 'LATN' }, { primaryLanguage: 'fr', script: 'Latn' }],
            // ['private use script', { script: 'Qabc' }, { script: 'Qabc' }],
            ['valid iso3166 region', { primaryLanguage: 'en', region: 'aq' }, { primaryLanguage: 'en', region: 'AQ' }],
            ['valid UN M.49 region', { primaryLanguage: 'es', region: '419' }, { primaryLanguage: 'es', region: '419' }],
            // ['private use region', { region: 'QX' }, { region: 'QX' }],
            ['valid variant', { primaryLanguage: 'es', variants: ['Valencia'] }, { primaryLanguage: 'es', variants: ['valencia'] }],
            [
                'valid variants',
                { primaryLanguage: 'es', variants: ['Valencia', 'lipaw'] },
                { primaryLanguage: 'es', variants: ['valencia', 'lipaw'] },
            ],
            ['valid private tag', { privateUse: ['Tag-one'] }, { privateUse: ['tag-one'] }],
        ])('succeeds for %p', (_desc, from, expected) => {
            expect(Bcp.ValidTag.validateParts(from as unknown as Bcp.LanguageTagParts, iana)).toSucceedWith(
                expected as unknown as Bcp.LanguageTagParts
            );
        });

        test.each([
            ['invalid primary language', { primaryLanguage: 'ENG' }, /invalid language/i],
            ['invalid extlang', { primaryLanguage: 'zh', extlangs: ['han'] }, /invalid extlang/i],
            ['multiple extlang', { primaryLanguage: 'zh', extlangs: ['Yue', 'Cmn'] }, /multiple extlang/i],
            ['invalid script', { primaryLanguage: 'en', script: 'AAAA' }, /invalid script/i],
            ['invalid region', { primaryLanguage: 'en', region: 'aj' }, /invalid region/i],
            ['invalid variant', { primaryLanguage: 'en', variants: ['xyzzy'] }, /invalid variant/i],
            ['invalid grandfathered tag', { grandfathered: 'i-dothraki' }, /invalid grandfathered/i],
            ['missing primary language', { script: 'Latn' }, /missing primary language/i],
            ['missing primary language with malformed private tags', { script: 'Latn', privateUse: [] }, /missing primary language/i],
        ])('fails for %p', (_desc, from, expected) => {
            expect(Bcp.ValidTag.validateParts(from as unknown as Bcp.LanguageTagParts, iana)).toFailWith(expected);
        });
    });
});
