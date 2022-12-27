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
import * as Iana from '../../../src/iana';
import { CanonicalTag } from '../../../src/bcp47';
import { ValidTag } from '../../../src/bcp47/validTag';

describe('CanonicalTag class', () => {
    const iana = Iana.IanaRegistries.load('data/iana').getValueOrThrow();

    describe('static create with string', () => {
        test.each([
            ['valid preferred tag', 'en-US', { primaryLanguage: 'en', region: 'US' }],
            ['valid grandfathered tag', 'art-lojban', { primaryLanguage: 'jbo' }],
            ['valid grandfathered tag with variants', 'en-GB-oed', { primaryLanguage: 'en', region: 'GB', variants: ['oxendict'] }],
            ['valid redundant tag with preferred value', 'zh-cmn-Hans', { primaryLanguage: 'cmn', script: 'Hans' }],
            ['valid redundant tag with no preferred value', 'yi-Latn', { primaryLanguage: 'yi', script: 'Latn' }],
            ['valid tag with deprecated primary language', 'in', { primaryLanguage: 'id' }],
            ['valid tag with suppressed script', 'en-Latn', { primaryLanguage: 'en' }],
            ['valid tag with deprecated region', 'en-BU', { primaryLanguage: 'en', region: 'MM' }],
            ['completely private tag', 'x-en-GB', { privateUse: ['en-GB'] }],
        ])('succeeds for %p', (_desc, tag, expected) => {
            expect(CanonicalTag.create(tag, iana)).toSucceedAndSatisfy((preferred) => {
                expect(preferred.parts).toEqual(expected);
            });
        });

        test.each([['invalid tag', 'eng-US', /invalid language/i]])('fails for %p', (_desc, tag, expected) => {
            expect(CanonicalTag.create(tag, iana)).toFailWith(expected);
        });
    });

    describe('static create with ValidTag', () => {
        test.each([['valid redundant tag with preferred value', 'zh-cmn-Hans', 'cmn-Hans']])('succeeds for %p', (_desc, from, expected) => {
            const valid = ValidTag.create(from, iana).getValueOrThrow();
            expect(CanonicalTag.create(valid, iana)).toSucceedAndSatisfy((preferred) => {
                expect(preferred.toString()).toEqual(expected);
            });
        });
    });
});
