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

describe('extlang subtag', () => {
    const extlang = new Tags.ExtLang();

    test('type is "extlang"', () => {
        expect(extlang.type).toBe('extlang');
    });

    test('is subtag', () => {
        expect(extlang.isSubtag).toBe(true);
    });

    describe('isWellFormed', () => {
        test.each(['abc', 'ABC', 'Xyz'])('%p is a well-formed extlang tag', (tag) => {
            expect(extlang.isWellFormed(tag)).toBe(true);
            expect(Tags.Converters.extLangSubtag.convert(tag)).toSucceedWith(tag as Tags.ExtLangSubtag);
        });

        test.each(['111', 'A', 'xyzzy'])('%p is not a well-formed extlang tag', (tag) => {
            expect(extlang.isWellFormed(tag)).toBe(false);
            expect(Tags.Converters.extLangSubtag.convert(tag)).toFailWith(/not a valid extlang subtag/i);
        });
    });

    describe('isCanonical', () => {
        test.each(['abc', 'xyz', 'ddd'])('%p is a canonical extlang tag', (tag) => {
            expect(extlang.isCanonical(tag)).toBe(true);
        });

        test.each(['ABC', 'Xyz', 'a00', 'a', 'ab', 'abcd'])('%p is not a canonical extlang tag', (tag) => {
            expect(extlang.isCanonical(tag)).toBe(false);
        });
    });

    describe('toCanonical', () => {
        test.each([
            ['ABC', 'abc'],
            ['def', 'def'],
            ['Xyz', 'xyz'],
        ])('canonical form of extlang %p is %p', (tag, canonical) => {
            expect(extlang.toCanonical(tag)).toSucceedWith(canonical as Tags.ExtLangSubtag);
        });

        test.each(['001', 'abcd', 'AB1', '1ABC'])('extlang %p has no canonical form', (tag) => {
            expect(extlang.toCanonical(tag)).toFailWith(/not a well-formed extlang/i);
        });
    });
});
