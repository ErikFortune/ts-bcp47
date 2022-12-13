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

import * as Converters from './converters';
import * as Model from './model';
import * as path from 'path';

export class TagRegistry {
    protected readonly _all: Model.RegistryEntry[];
    protected readonly _language: Map<Model.LanguageSubtag, Model.LanguageSubtagRegistryEntry> = new Map();
    protected readonly _extlang: Map<Model.ExtLangSubtag, Model.ExtLangSubtagRegistryEntry> = new Map();
    protected readonly _script: Map<Model.ScriptSubtag, Model.ScriptSubtagRegistryEntry> = new Map();
    protected readonly _region: Map<Model.RegionSubtag, Model.RegionSubtagRegistryEntry> = new Map();
    protected readonly _variant: Map<Model.VariantSubtag, Model.VariantSubtagRegistryEntry> = new Map();
    protected readonly _grandfathered: Map<Model.GrandfatheredTag, Model.GrandfatheredTagRegistryEntry> = new Map();
    protected readonly _redundant: Map<Model.RedundantTag, Model.RedundantTagRegistryEntry> = new Map();

    protected constructor(root: string) {
        this._all = Converters.loadIanaRegistrySync(path.join(root, 'registry.json')).getValueOrThrow();
        for (const entry of this._all) {
            switch (entry.Type) {
                case 'language':
                    this._language.set(entry.Subtag, entry);
                    break;
                case 'extlang':
                    this._extlang.set(entry.Subtag, entry);
                    break;
                case 'script':
                    this._script.set(entry.Subtag, entry);
                    break;
                case 'region':
                    this._region.set(entry.Subtag, entry);
                    break;
                case 'variant':
                    this._variant.set(entry.Subtag, entry);
                    break;
                case 'grandfathered':
                    this._grandfathered.set(entry.Tag, entry);
                    break;
                case 'redundant':
                    this._redundant.set(entry.Tag, entry);
                    break;
            }
        }
    }
}
