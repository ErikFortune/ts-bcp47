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
import { Result, captureResult } from '@fgv/ts-utils';
import { Scope } from './scope';

export class TagRegistry {
    public readonly languages: Scope<Model.LanguageSubtag, Model.LanguageSubtagRegistryEntry>;
    public readonly extlangs: Scope<Model.ExtLangSubtag, Model.ExtLangSubtagRegistryEntry>;
    public readonly scripts: Scope<Model.ScriptSubtag, Model.ScriptSubtagRegistryEntry>;
    public readonly regions: Scope<Model.RegionSubtag, Model.RegionSubtagRegistryEntry>;
    public readonly variants: Scope<Model.VariantSubtag, Model.VariantSubtagRegistryEntry>;
    public readonly grandfathered: Scope<Model.GrandfatheredTag, Model.GrandfatheredTagRegistryEntry>;
    public readonly redundant: Scope<Model.RedundantTag, Model.RedundantTagRegistryEntry>;

    protected readonly _all: Model.RegistryEntry[];

    protected constructor(root: string) {
        this.languages = new Scope();
        this.extlangs = new Scope();
        this.scripts = new Scope();
        this.regions = new Scope();
        this.variants = new Scope();
        this.grandfathered = new Scope();
        this.redundant = new Scope();

        this._all = Converters.loadIanaRegistrySync(path.join(root, 'registry.json')).getValueOrThrow();
        for (const entry of this._all) {
            switch (entry.Type) {
                case 'language':
                    this.languages.add(entry.Subtag, entry);
                    break;
                case 'extlang':
                    this.extlangs.add(entry.Subtag, entry);
                    break;
                case 'script':
                    this.scripts.add(entry.Subtag, entry);
                    break;
                case 'region':
                    this.regions.add(entry.Subtag, entry);
                    break;
                case 'variant':
                    this.variants.add(entry.Subtag, entry);
                    break;
                case 'grandfathered':
                    this.grandfathered.add(entry.Tag, entry);
                    break;
                case 'redundant':
                    this.redundant.add(entry.Tag, entry);
                    break;
            }
        }
    }

    public static load(root: string): Result<TagRegistry> {
        return captureResult(() => new TagRegistry(root));
    }
}
