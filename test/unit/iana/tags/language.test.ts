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
import { Tags } from '../../../../src/iana';

describe('language subtag', () => {
    const language = new Tags.Language();

    test('type is "language"', () => {
        expect(language.type).toBe('language');
    });

    test('is subtag', () => {
        expect(language.isSubtag).toBe(true);
    });

    describe('isWellFormed', () => {
        test.each(['en', 'DE', 'abc', 'ABC', 'Xyz'])('%p is a well-formed language tag', (tag) => {
            expect(language.isWellFormed(tag)).toBe(true);
            expect(Tags.Converters.languageSubtag.convert(tag)).toSucceedWith(tag as Tags.LanguageSubtag);
        });

        test.each(['111', 'A', 'xyzzy', 'en1', 'en-US'])('%p is malformed language tag', (tag) => {
            expect(language.isWellFormed(tag)).toBe(false);
            expect(Tags.Converters.languageSubtag.convert(tag)).toFailWith(/not a valid language subtag/i);
        });
    });

    describe('isCanonical', () => {
        test.each(['en', 'zh', 'han'])('%p is a canonical language tag', (tag) => {
            expect(language.isCanonical(tag)).toBe(true);
        });

        test.each(['EN', 'US', 'De', 'a', '_ab', 'abcd'])('%p is not a canonical language tag', (tag) => {
            expect(language.isCanonical(tag)).toBe(false);
        });
    });

    describe('toCanonical', () => {
        test.each([
            ['EN', 'en'],
            ['ABC', 'abc'],
            ['def', 'def'],
            ['Xyz', 'xyz'],
        ])('canonical form of language %p is %p', (tag, canonical) => {
            expect(language.toCanonical(tag)).toSucceedWith(canonical as Tags.LanguageSubtag);
        });

        test.each(['001', 'abcd', 'AB1', '1ABC'])('extlang %p has no canonical form', (tag) => {
            expect(language.toCanonical(tag)).toFailWith(/malformed language/i);
        });
    });
});
