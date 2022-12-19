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

describe('script subtag', () => {
    const script = new Tags.Script();

    test('type is "script"', () => {
        expect(script.type).toBe('script');
    });

    test('is subtag', () => {
        expect(script.isSubtag).toBe(true);
    });

    describe('isWellFormed', () => {
        test.each(['latn', 'CYRL', 'Latn'])('%p is a well-formed script tag', (tag) => {
            expect(script.isWellFormed(tag)).toBe(true);
            expect(Tags.Converters.scriptSubtag.convert(tag)).toSucceedWith(tag as Tags.ScriptSubtag);
        });

        test.each(['l', 'la', 'lat', 'latin', 'xyzzy', 'Lat1'])('%p is malformed script tag', (tag) => {
            expect(script.isWellFormed(tag)).toBe(false);
            expect(Tags.Converters.scriptSubtag.convert(tag)).toFailWith(/not a valid script subtag/i);
        });
    });

    describe('isCanonical', () => {
        test.each(['Latn', 'Cyrl', 'Test'])('%p is a canonical script tag', (tag) => {
            expect(script.isCanonical(tag)).toBe(true);
        });

        test.each(['latn', 'LATN', 'LAtn', 'a', 'ab', 'abc', 'La7n'])('%p is not a canonical script tag', (tag) => {
            expect(script.isCanonical(tag)).toBe(false);
        });
    });

    describe('toCanonical', () => {
        test.each([
            ['latn', 'Latn'],
            ['LATN', 'Latn'],
            ['Cyrl', 'Cyrl'],
        ])('canonical form of script %p is %p', (tag, canonical) => {
            expect(script.toCanonical(tag)).toSucceedWith(canonical as Tags.ScriptSubtag);
        });

        test.each(['001', 'abcde', 'AB1', '1ABC'])('script %p has no canonical form', (tag) => {
            expect(script.toCanonical(tag)).toFailWith(/malformed script/i);
        });
    });
});
