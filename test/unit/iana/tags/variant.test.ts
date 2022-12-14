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

describe('variant subtag', () => {
    const variant = new Tags.Variant();

    test('type is "variant"', () => {
        expect(variant.type).toBe('variant');
    });

    test('is subtag', () => {
        expect(variant.isSubtag).toBe(true);
    });

    describe('isWellFormed', () => {
        test.each(['1920', 'variant', '1920DE', 'varia', 'varian', 'VariantX', 'variant8'])('%p is a well-formed variant tag', (tag) => {
            expect(variant.isWellFormed(tag)).toBe(true);
            expect(Tags.Converters.variantSubtag.convert(tag)).toSucceedWith(tag as Tags.VariantSubtag);
        });

        test.each(['l', 'la', 'lat', 'latin-variant', 'longVariant'])('%p is not a well-formed variant tag', (tag) => {
            expect(variant.isWellFormed(tag)).toBe(false);
            expect(Tags.Converters.variantSubtag.convert(tag)).toFailWith(/not a valid variant subtag/i);
        });
    });

    describe('isCanonical', () => {
        test.each(['1920', '1920de', 'variant', 'variant8'])('%p is a canonical variant tag', (tag) => {
            expect(variant.isCanonical(tag)).toBe(true);
        });

        test.each(['vary', 'v192', 'Variant', 'VARIANT'])('%p is not a canonical variant tag', (tag) => {
            expect(variant.isCanonical(tag)).toBe(false);
        });
    });

    describe('toCanonical', () => {
        test.each([
            ['1999', '1999'],
            ['1999EN1', '1999en1'],
            ['variant', 'variant'],
            ['VARIANT', 'variant'],
            ['Varies', 'varies'],
        ])('canonical form of variant %p is %p', (tag, canonical) => {
            expect(variant.toCanonical(tag)).toSucceedWith(canonical as Tags.VariantSubtag);
        });

        test.each(['001', 'bad!var', 'AB1', 'longvariant'])('variant %p has no canonical form', (tag) => {
            expect(variant.toCanonical(tag)).toFailWith(/not a well-formed variant/i);
        });
    });
});
