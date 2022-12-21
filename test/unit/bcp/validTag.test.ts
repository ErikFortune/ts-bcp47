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

describe('ValidTag class', () => {
    const iana = Iana.TagRegistry.load('data/iana/registry.json').getValueOrThrow();

    describe('validateParts static method', () => {
        test.each([
            ['valid canonical primary language', { primaryLanguage: 'en' }, { primaryLanguage: 'en' }],
            ['valid primary language', { primaryLanguage: 'EN' }, { primaryLanguage: 'en' }],
            ['valid canonical extlangs', { extlangs: ['yue', 'cmn'] }, { extlangs: ['yue', 'cmn'] }],
            ['valid extlangs', { extlangs: ['Yue', 'Cmn'] }, { extlangs: ['yue', 'cmn'] }],
        ])('succeeds for %p', (_desc, from, expected) => {
            expect(Bcp.ValidTag.validateParts(from as unknown as Bcp.LanguageTagParts, iana)).toSucceedWith(
                expected as unknown as Bcp.LanguageTagParts
            );
        });

        test.each([
            ['invalid primary language', { primaryLanguage: 'ENG' }, /invalid language/i],
            ['invalid extlang', { extlangs: ['han'] }, /invalid extlang/i],
        ])('fails for %p', (_desc, from, expected) => {
            expect(Bcp.ValidTag.validateParts(from as unknown as Bcp.LanguageTagParts, iana)).toFailWith(expected);
        });
    });
});
