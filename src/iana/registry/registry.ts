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
import * as Scope from './scope';
import * as path from 'path';

import { Result, captureResult } from '@fgv/ts-utils';
import { RegisteredItem } from './registeredItems';

export class TagRegistry {
    public readonly languages: Scope.LanguageSubtagScope = new Scope.LanguageSubtagScope();
    public readonly extlangs: Scope.ExtLangSubtagScope = new Scope.ExtLangSubtagScope();
    public readonly scripts: Scope.ScriptSubtagScope = new Scope.ScriptSubtagScope();
    public readonly regions: Scope.RegionSubtagScope = new Scope.RegionSubtagScope();
    public readonly variants: Scope.VariantSubtagScope = new Scope.VariantSubtagScope();

    public readonly collections: Scope.LanguageSubtagScope = new Scope.LanguageSubtagScope();
    public readonly macrolanguages: Scope.LanguageSubtagScope = new Scope.LanguageSubtagScope();
    public readonly privateUse: Scope.LanguageSubtagScope = new Scope.LanguageSubtagScope();
    public readonly special: Scope.LanguageSubtagScope = new Scope.LanguageSubtagScope();

    public readonly grandfathered: Scope.GrandfatheredTagScope = new Scope.GrandfatheredTagScope();
    public readonly redundant: Scope.RedundantTagScope = new Scope.RedundantTagScope();

    protected readonly _all: RegisteredItem[];

    protected constructor(items: RegisteredItem[]) {
        this._all = items;
        for (const entry of this._all) {
            switch (entry.type) {
                case 'language':
                    this.languages.add(entry);
                    if (entry.scope === 'macrolanguage') {
                        this.macrolanguages.add(entry);
                    } else if (entry.scope === 'collection') {
                        this.collections.add(entry);
                    } else if (entry.scope === 'private-use') {
                        this.privateUse.add(entry);
                    } else if (entry.scope === 'special') {
                        this.special.add(entry);
                    }
                    break;
                case 'extlang':
                    this.extlangs.add(entry);
                    break;
                case 'script':
                    this.scripts.add(entry);
                    break;
                case 'region':
                    this.regions.add(entry);
                    break;
                case 'variant':
                    this.variants.add(entry);
                    break;
                case 'grandfathered':
                    this.grandfathered.add(entry);
                    break;
                case 'redundant':
                    this.redundant.add(entry);
                    break;
            }
        }
    }

    public static create(items: RegisteredItem[]): Result<TagRegistry> {
        return captureResult(() => {
            return new TagRegistry(items);
        });
    }

    public static load(root: string): Result<TagRegistry> {
        return captureResult(() => {
            const items = Converters.loadIanaRegistryItemsSync(path.join(root, 'registry.json')).getValueOrThrow();
            return new TagRegistry(items);
        });
    }
}
