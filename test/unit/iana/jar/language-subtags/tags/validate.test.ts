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
import * as Converters from '../../../../../../src/iana/jar/language-subtags/tags/converters';
import { LanguageSubtag } from '../../../../../../src/iana/jar/language-subtags/tags';
import { Validate } from '../../../../../../src/iana/jar/language-subtags/tags';

describe('Iana common validators', () => {
    describe('language subtag', () => {
        const v = Validate.languageSubtag;
        const c = Converters.languageSubtag;

        test.each(['en', 'enu', 'zh'])('%p is a well-formed canonical language subtag', (code) => {
            expect(v.isWellFormed(code)).toBe(true);
            expect(v.converter.convert(code)).toSucceedWith(code as LanguageSubtag);
            expect(c.convert(code)).toSucceedWith(code as LanguageSubtag);

            expect(v.isCanonical(code)).toBe(true);
            expect(v.toCanonical(code)).toSucceedWith(code as LanguageSubtag);
        });

        test.each(['EN', 'SpA', 'fR'])('%p is a well-formed non-canonical language subtag', (code) => {
            expect(v.isWellFormed(code)).toBe(true);
            expect(v.converter.convert(code)).toSucceedWith(code as LanguageSubtag);
            expect(c.convert(code)).toSucceedWith(code as LanguageSubtag);

            expect(v.isCanonical(code)).toBe(false);
            expect(v.toCanonical(code)).toSucceedWith(code.toLowerCase() as LanguageSubtag);
        });

        test.each(['us1', 'Deutsch', 'f', '12'])('%p is not a well-formed or canonical language subtag', (code) => {
            expect(v.isWellFormed(code)).toBe(false);
            expect(v.converter.convert(code)).toFailWith(/invalid.*language subtag/i);
            expect(c.convert(code)).toFailWith(/invalid.*language subtag/i);

            expect(v.isCanonical(code)).toBe(false);
            expect(v.toCanonical(code)).toFailWith(/invalid.*language subtag/i);
        });
    });
});
