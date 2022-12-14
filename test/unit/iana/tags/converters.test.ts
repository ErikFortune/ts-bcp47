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
import { Converters, LanguageSubtag } from '../../../../src/iana/tags';

describe('tag converters', () => {
    describe('tagRange converter', () => {
        const range = Converters.rangeOfTags(Converters.languageSubtag);
        test.each([
            ['qaa..qzz', ['qaa', 'qzz']],
            ['xa..xz', ['xa', 'xz']],
        ])('converts %p to %p', (tags, vals) => {
            expect(range.convert(tags)).toSucceedWith(vals as LanguageSubtag[]);
        });

        test.each([
            [10, /not a string/i],
            ['qaa...qzz', /not a valid language/i],
            ['001..qaa', /not a valid language/i],
            ['qaa..001', /not a valid language/i],
            ['..en', /malformed tag range/i],
            ['en..', /malformed tag range/i],
            ['aa..mmm..zzz', /malformed tag range/i],
            ['en', /malformed tag range/i],
        ])('fails for %p (%p)', (tags, reason) => {
            expect(range.convert(tags)).toFailWith(reason);
        });
    });
});
