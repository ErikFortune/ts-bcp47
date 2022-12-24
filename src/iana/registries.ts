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

import { Result, captureResult } from '@fgv/ts-utils';

import { LanguageSubtagRegistry } from './language-subtags';
import { LanguageTagExtensionRegistry } from './language-tag-extensions';
import path from 'path';

export class IanaRegistries {
    public readonly subtags: LanguageSubtagRegistry;
    public readonly extensions: LanguageTagExtensionRegistry;

    protected constructor(subtags: LanguageSubtagRegistry, extensions: LanguageTagExtensionRegistry) {
        this.subtags = subtags;
        this.extensions = extensions;
    }

    public static load(root: string): Result<IanaRegistries> {
        return captureResult(() => {
            const subtags = LanguageSubtagRegistry.load(path.join(root, 'language-subtags.json')).getValueOrThrow();
            const extensions = LanguageTagExtensionRegistry.load(path.join(root, 'language-tag-extensions.json')).getValueOrThrow();
            return new IanaRegistries(subtags, extensions);
        });
    }
}
