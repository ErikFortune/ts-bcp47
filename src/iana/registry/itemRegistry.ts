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
import * as Scope from './itemScope';
import * as path from 'path';

import { Result, captureResult } from '@fgv/ts-utils';
import { RegisteredItem } from './registeredItems';

export class ItemRegistry {
    public readonly languages: Scope.LanguageItemScope = new Scope.LanguageItemScope();
    public readonly extlangs: Scope.ExtLangItemScope = new Scope.ExtLangItemScope();
    public readonly scripts: Scope.ScriptItemScope = new Scope.ScriptItemScope();
    public readonly regions: Scope.RegionItemScope = new Scope.RegionItemScope();
    public readonly variants: Scope.VariantItemScope = new Scope.VariantItemScope();

    public readonly collections: Scope.LanguageItemScope = new Scope.LanguageItemScope();
    public readonly macrolanguages: Scope.LanguageItemScope = new Scope.LanguageItemScope();
    public readonly privateUse: Scope.LanguageItemScope = new Scope.LanguageItemScope();
    public readonly special: Scope.LanguageItemScope = new Scope.LanguageItemScope();

    public readonly grandfathered: Scope.GrandfatheredTagScope = new Scope.GrandfatheredTagScope();
    public readonly redundant: Scope.RedundantTagScope = new Scope.RedundantTagScope();

    protected readonly _all: RegisteredItem[];

    protected constructor(root: string) {
        this._all = Converters.loadIanaRegistryItemsSync(path.join(root, 'registry.json')).getValueOrThrow();
        for (const entry of this._all) {
            switch (entry.type) {
                case 'language':
                    this.languages.add(entry.subtag, entry);
                    if (entry.scope === 'macrolanguage') {
                        this.macrolanguages.add(entry.subtag, entry);
                    } else if (entry.scope === 'collection') {
                        this.collections.add(entry.subtag, entry);
                    } else if (entry.scope === 'private-use') {
                        this.privateUse.add(entry.subtag, entry);
                    } else if (entry.scope === 'special') {
                        this.special.add(entry.subtag, entry);
                    }
                    break;
                case 'extlang':
                    this.extlangs.add(entry.subtag, entry);
                    break;
                case 'script':
                    this.scripts.add(entry.subtag, entry);
                    break;
                case 'region':
                    this.regions.add(entry.subtag, entry);
                    break;
                case 'variant':
                    this.variants.add(entry.subtag, entry);
                    break;
                case 'grandfathered':
                    this.grandfathered.add(entry.tag, entry);
                    break;
                case 'redundant':
                    this.redundant.add(entry.tag, entry);
                    break;
            }
        }
    }

    public static load(root: string): Result<ItemRegistry> {
        return captureResult(() => new ItemRegistry(root));
    }
}
