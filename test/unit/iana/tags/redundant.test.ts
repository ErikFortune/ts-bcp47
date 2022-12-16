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

describe('redundant tag', () => {
    const gf = new Tags.Redundant();

    test('type is "redundant"', () => {
        expect(gf.type).toBe('redundant');
    });

    test('is tag', () => {
        expect(gf.isSubtag).toBe(false);
    });

    describe('isWellFormed', () => {
        test.each(['art-lojban', 'en-gb-oed', 'i-foo'])('%p is a well-formed redundant tag', (tag) => {
            expect(gf.isWellFormed(tag)).toBe(true);
            expect(Tags.Converters.redundantTag.convert(tag)).toSucceedWith(tag as Tags.RedundantTag);
        });

        test.each(['*$!', 'this-that!'])('%p is not a well-formed redundant tag', (tag) => {
            expect(gf.isWellFormed(tag)).toBe(false);
            expect(Tags.Converters.redundantTag.convert(tag)).toFailWith(/not a valid redundant tag/i);
        });
    });

    describe('isCanonical', () => {
        test.each(['en-GB-oed', 'i-klingon', 'sgn-BE-FR'])('%p is a canonical redundant tag', (tag) => {
            expect(gf.isCanonical(tag)).toBe(true);
        });

        test.each(['en-gb-oed', 'EN-us', 'i-Klingon', 'SGN-BE-FR', 'bad+tag'])('%p is not a canonical redundant tag', (tag) => {
            expect(gf.isCanonical(tag)).toBe(false);
        });
    });

    describe('toCanonical', () => {
        test.each([
            ['en-gb-oed', 'en-GB-oed'],
            ['i-Klingon', 'i-klingon'],
            ['SGN-BE-FR', 'sgn-BE-FR'],
            ['sgn-be-nl', 'sgn-BE-NL'],
            ['zh-min-nan', 'zh-min-nan'],
        ])('canonical form of redundant %p is %p', (tag, canonical) => {
            expect(gf.toCanonical(tag)).toSucceedWith(canonical as Tags.RedundantTag);
        });

        test.each(['en-us+something'])('redundant %p has no canonical form', (tag) => {
            expect(gf.toCanonical(tag)).toFailWith(/not a well-formed redundant tag/i);
        });
    });
});
