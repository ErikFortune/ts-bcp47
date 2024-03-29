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
import * as JarConverters from '../../../../src/iana/language-subtags/jarConverters';
import { LanguageSubtagRegistry } from '../../../../src/iana/language-subtags';

describe('LanguageSubtagRegistry class', () => {
    describe('create static method', () => {
        test('creates from a supplied a tag registry', () => {
            const registry = JarConverters.loadJsonSubtagRegistryFileSync('test/data/iana/language-subtag-registry.json').orThrow();
            expect(LanguageSubtagRegistry.create(registry)).toSucceedAndSatisfy((tags) => {
                expect(tags.languages.getAllKeys()).toHaveLength(8759);
                expect(tags.extlangs.getAllKeys()).toHaveLength(252);
                expect(tags.scripts.getAllKeys()).toHaveLength(261);
                expect(tags.regions.getAllKeys()).toHaveLength(342);
                expect(tags.variants.getAllKeys()).toHaveLength(110);

                expect(tags.collections.getAllKeys()).toHaveLength(116);
                expect(tags.macrolanguages.getAllKeys()).toHaveLength(62);
                expect(tags.privateUse.getAllKeys()).toHaveLength(520);
                expect(tags.special.getAllKeys()).toHaveLength(4);

                expect(tags.grandfathered.getAllKeys()).toHaveLength(26);
                expect(tags.redundant.getAllKeys()).toHaveLength(67);
            });
        });
    });

    describe('load static methods', () => {
        test('loads JSON subtags', () => {
            expect(LanguageSubtagRegistry.load('src/data/iana/language-subtags.json')).toSucceedAndSatisfy((tags) => {
                expect(tags.languages.getAllKeys()).toHaveLength(8759);
                expect(tags.extlangs.getAllKeys()).toHaveLength(252);
                expect(tags.scripts.getAllKeys()).toHaveLength(261);
                expect(tags.regions.getAllKeys()).toHaveLength(342);
                expect(tags.variants.getAllKeys()).toHaveLength(110);

                expect(tags.collections.getAllKeys()).toHaveLength(116);
                expect(tags.macrolanguages.getAllKeys()).toHaveLength(62);
                expect(tags.privateUse.getAllKeys()).toHaveLength(520);
                expect(tags.special.getAllKeys()).toHaveLength(4);

                expect(tags.grandfathered.getAllKeys()).toHaveLength(26);
                expect(tags.redundant.getAllKeys()).toHaveLength(67);
            });
        });

        test('loads JAR as JSON subtag registry', () => {
            expect(LanguageSubtagRegistry.loadJsonRegistryFile('test/data/iana/language-subtag-registry.json')).toSucceedAndSatisfy(
                (tags) => {
                    expect(tags.languages.getAllKeys()).toHaveLength(8759);
                    expect(tags.extlangs.getAllKeys()).toHaveLength(252);
                    expect(tags.scripts.getAllKeys()).toHaveLength(261);
                    expect(tags.regions.getAllKeys()).toHaveLength(342);
                    expect(tags.variants.getAllKeys()).toHaveLength(110);

                    expect(tags.collections.getAllKeys()).toHaveLength(116);
                    expect(tags.macrolanguages.getAllKeys()).toHaveLength(62);
                    expect(tags.privateUse.getAllKeys()).toHaveLength(520);
                    expect(tags.special.getAllKeys()).toHaveLength(4);

                    expect(tags.grandfathered.getAllKeys()).toHaveLength(26);
                    expect(tags.redundant.getAllKeys()).toHaveLength(67);
                }
            );
        });

        test('loads JAR subtag registry', () => {
            expect(LanguageSubtagRegistry.loadTxtRegistryFile('test/data/iana/language-subtag-registry.txt')).toSucceedAndSatisfy(
                (tags) => {
                    expect(tags.languages.getAllKeys()).toHaveLength(8759);
                    expect(tags.extlangs.getAllKeys()).toHaveLength(252);
                    expect(tags.scripts.getAllKeys()).toHaveLength(261);
                    expect(tags.regions.getAllKeys()).toHaveLength(342);
                    expect(tags.variants.getAllKeys()).toHaveLength(110);

                    expect(tags.collections.getAllKeys()).toHaveLength(116);
                    expect(tags.macrolanguages.getAllKeys()).toHaveLength(62);
                    expect(tags.privateUse.getAllKeys()).toHaveLength(520);
                    expect(tags.special.getAllKeys()).toHaveLength(4);

                    expect(tags.grandfathered.getAllKeys()).toHaveLength(26);
                    expect(tags.redundant.getAllKeys()).toHaveLength(67);
                }
            );
        });
    });
});
