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
import { LanguageTag } from '../../../src/bcp47';
import { LanguageTagInitOptions } from '../../../src/bcp47/languageTag';

import { GenericLanguageTagTestInit, GenericLanguageTagTest, CreateFromTagTestCase, CreateFromTagTestCaseFactory } from './languageTagHelpers';

const testCaseInit: GenericLanguageTagTestInit[] = [
    {
        description: 'well-formed, non-canonical language-region',
        from: 'en-us',
        expected: [
            ['en-us', ['default', 'wellFormed', 'valid', 'strictlyValid']],
            ['en-US', ['wellFormedCanonical', 'validCanonical', 'strictlyValidCanonical', 'preferred', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'valid grandfathered tag',
        from: 'art-lojban',
        expected: [
            [
                'art-lojban',
                ['default', 'wellFormed', 'wellFormedCanonical', 'valid', 'validCanonical', 'strictlyValid', 'strictlyValidCanonical'],
            ],
            ['lbo', ['preferred', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'malformed tag',
        from: 'invalid-tag',
        expected: [
            [
                /no primary language subtag/i,
                [
                    'default',
                    'wellFormed',
                    'wellFormedCanonical',
                    'valid',
                    'validCanonical',
                    'strictlyValid',
                    'strictlyValidCanonical',
                    'strictlyValidPreferred',
                ],
            ],
        ],
    },
];

const genericTests = testCaseInit.map(GenericLanguageTagTest.mapInitToTestCases);

describe('LanguageTag class', () => {
    describe('create method', () => {
        describe('default options', () => {
            test.each(CreateFromTagTestCaseFactory.emit('default', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('well-formed', () => {
            test.each(CreateFromTagTestCaseFactory.emit('wellFormed', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('well-formed canonical', () => {
            test.each(CreateFromTagTestCaseFactory.emit('wellFormedCanonical', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('valid', () => {
            test.each(CreateFromTagTestCaseFactory.emit('valid', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('valid canonical', () => {
            test.each(CreateFromTagTestCaseFactory.emit('validCanonical', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('preferred', () => {
            test.each(CreateFromTagTestCaseFactory.emit('preferred', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid', () => {
            test.each(CreateFromTagTestCaseFactory.emit('strictlyValid', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid canonical', () => {
            test.each(CreateFromTagTestCaseFactory.emit('strictlyValidCanonical', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });

        describe('strictly valid preferred', () => {
            test.each(CreateFromTagTestCaseFactory.emit('strictlyValidPreferred', genericTests))('%p', (_desc, tc) => {
                tc.invoke();
            });
        });
    });
});
