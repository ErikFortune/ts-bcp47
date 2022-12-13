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
        const languages: Map<Model.LanguageSubtag, Model.LanguageSubtagRegistryEntry> = new Map();
        const extlangs: Map<Model.ExtLangSubtag, Model.ExtLangSubtagRegistryEntry> = new Map();
        const scripts: Map<Model.ScriptSubtag, Model.ScriptSubtagRegistryEntry> = new Map();
        const regions: Map<Model.RegionSubtag, Model.RegionSubtagRegistryEntry> = new Map();
        const variants: Map<Model.VariantSubtag, Model.VariantSubtagRegistryEntry> = new Map();
        const grandfathered: Map<Model.GrandfatheredTag, Model.GrandfatheredTagRegistryEntry> = new Map();
        const redundant: Map<Model.RedundantTag, Model.RedundantTagRegistryEntry> = new Map();

        this._all = Converters.loadIanaRegistrySync(path.join(root, 'registry.json')).getValueOrThrow();
        for (const entry of this._all) {
            switch (entry.Type) {
                case 'language':
                    languages.set(entry.Subtag, entry);
                    break;
                case 'extlang':
                    extlangs.set(entry.Subtag, entry);
                    break;
                case 'script':
                    scripts.set(entry.Subtag, entry);
                    break;
                case 'region':
                    regions.set(entry.Subtag, entry);
                    break;
                case 'variant':
                    variants.set(entry.Subtag, entry);
                    break;
                case 'grandfathered':
                    grandfathered.set(entry.Tag, entry);
                    break;
                case 'redundant':
                    redundant.set(entry.Tag, entry);
                    break;
            }
        }

        this.languages = new Scope(languages);
        this.extlangs = new Scope(extlangs);
        this.scripts = new Scope(scripts);
        this.regions = new Scope(regions);
        this.variants = new Scope(variants);
        this.grandfathered = new Scope(grandfathered);
        this.redundant = new Scope(redundant);
    }

    public static load(root: string): Result<TagRegistry> {
        return captureResult(() => new TagRegistry(root));
    }
}
