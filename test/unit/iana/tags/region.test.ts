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

describe('region subtag', () => {
    const region = new Tags.Region();

    test('type is "region"', () => {
        expect(region.type).toBe('region');
    });

    test('is subtag', () => {
        expect(region.isSubtag).toBe(true);
    });

    describe('isAlpha2RegionCode', () => {
        test.each(['en', 'DE'])('%p is a well-formed alpha-2 region tag', (tag) => {
            expect(region.isAlpha2RegionCode(tag)).toBe(true);
        });

        test.each(['1', 'A', 'DEU', '01', '001', 'a!', 'ESPN', 'en-US'])('%p is not a well-formed alpha-2 region tag', (tag) => {
            expect(region.isAlpha2RegionCode(tag)).toBe(false);
        });
    });

    describe('isAlpha3RegionCode', () => {
        test.each(['usa', 'DEU', 'Jpn'])('%p is a well-formed alpha-3 region tag', (tag) => {
            expect(region.isAlpha3RegionCode(tag)).toBe(true);
        });

        test.each(['1', 'us', '01', '001', 'a!', 'ESPN', 'en-US'])('%p is not a well-formed alpha-3 region tag', (tag) => {
            expect(region.isAlpha3RegionCode(tag)).toBe(false);
        });
    });

    describe('isUnM49RegionCode', () => {
        test.each(['001', '419'])('%p is a well-formed UN M.49 region tag', (tag) => {
            expect(region.isUnM49RegionCode(tag)).toBe(true);
        });

        test.each(['1', 'US', 'DEU', '01', '0001', '00!', 'ESPN', 'en-US'])('%p is not a well-formed UN M.49 region tag', (tag) => {
            expect(region.isUnM49RegionCode(tag)).toBe(false);
        });
    });

    describe('isWellFormed', () => {
        test.each(['en', 'DE', 'USA', '001', '419'])('%p is a well-formed region tag', (tag) => {
            expect(region.isWellFormed(tag)).toBe(true);
        });

        test.each(['1', 'A', 'ESPN', 'en-US'])('%p is not a well-formed region tag', (tag) => {
            expect(region.isWellFormed(tag)).toBe(false);
        });
    });

    describe('isCanonical', () => {
        test.each(['US', 'DE', 'DEU', '001'])('%p is a canonical region tag', (tag) => {
            expect(region.isCanonical(tag)).toBe(true);
        });

        test.each(['us', 'es', 'De', '1', '0419', 'a', '_ab', 'abcd', 'A!'])('%p is not a canonical region tag', (tag) => {
            expect(region.isCanonical(tag)).toBe(false);
        });
    });

    describe('toCanonical', () => {
        test.each([
            ['us', 'US'],
            ['Ja', 'JA'],
            ['DE', 'DE'],
            ['001', '001'],
        ])('canonical form of region %p is %p', (tag, canonical) => {
            expect(region.toCanonical(tag)).toSucceedWith(canonical as Tags.RegionSubtag);
        });

        test.each(['0001', 'abcd', 'AB1', '1ABC', 'U!'])('extlang %p has no canonical form', (tag) => {
            expect(region.toCanonical(tag)).toFailWith(/not a well-formed region/i);
        });
    });
});
