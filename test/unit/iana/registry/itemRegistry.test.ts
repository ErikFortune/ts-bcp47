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
import { ItemRegistry } from '../../../../src/iana/registry/itemRegistry';

describe('IANA TagRegistry class', () => {
    describe('load static method', () => {
        test('loads a tag registry', () => {
            expect(ItemRegistry.load('node_modules/language-subtag-registry/data/json')).toSucceedAndSatisfy((tags) => {
                expect(tags.languages.getAllTags()).toHaveLength(8241);
                expect(tags.extlangs.getAllTags()).toHaveLength(252);
                expect(tags.scripts.getAllTags()).toHaveLength(213);
                expect(tags.regions.getAllTags()).toHaveLength(306);
                expect(tags.variants.getAllTags()).toHaveLength(109);

                expect(tags.collections.getAllTags()).toHaveLength(116);
                expect(tags.macrolanguages.getAllTags()).toHaveLength(62);
                expect(tags.privateUse.getAllTags()).toHaveLength(2);
                expect(tags.special.getAllTags()).toHaveLength(4);

                expect(tags.grandfathered.getAllTags()).toHaveLength(26);
                expect(tags.redundant.getAllTags()).toHaveLength(67);
            });
        });
    });
});
