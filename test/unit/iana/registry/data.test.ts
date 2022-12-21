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
import { loadIanaRegistryJsonFileSync, loadIanaRegistryTxtFileSync } from '../../../../src/iana/registry/converters';
import { Converters as RegistryConverters } from '../../../../src/iana/registry';

describe('IANA registry data files', () => {
    test('can load registry JSON', () => {
        expect(loadIanaRegistryJsonFileSync('data/iana/registry.json')).toSucceed();
    });

    test('can load registry.txt and convert to JSON', () => {
        expect(loadIanaRegistryTxtFileSync('data/iana/registry.txt')).toSucceedAndSatisfy((records) => {
            expect(RegistryConverters.registryFile.convert(records)).toSucceed();
        });
    });

    test('registry.json and registry.txt are equivalent', () => {
        const json = loadIanaRegistryJsonFileSync('data/iana/registry.json').getValueOrThrow();
        const txt = loadIanaRegistryTxtFileSync('data/iana/registry.txt')
            .onSuccess((r) => {
                return RegistryConverters.registryFile.convert(r);
            })
            .getValueOrThrow();
        expect(json).toEqual(txt);
    });
});
