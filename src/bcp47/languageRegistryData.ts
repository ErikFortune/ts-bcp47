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

import * as Iana from '../iana';

import { Subtags, subtagsToString } from './common';

/**
 * @public
 */
export class LanguageRegistryData {
    /**
     * @internal
     */
    protected _iana: Iana.LanguageRegistries;
    /**
     * @internal
     */
    protected _subtags: Subtags;
    /**
     * @internal
     */
    protected _primaryLanguage?: Iana.LanguageSubtags.Model.RegisteredLanguage | false;
    /**
     * @internal
     */
    protected _extlangs?: Iana.LanguageSubtags.Model.RegisteredExtLang[] | false;
    /**
     * @internal
     */
    protected _script?: Iana.LanguageSubtags.Model.RegisteredScript | false;
    /**
     * @internal
     */
    protected _region?: Iana.LanguageSubtags.Model.RegisteredRegion | false;
    /**
     * @internal
     */
    protected _grandfathered?: Iana.LanguageSubtags.Model.RegisteredGrandfatheredTag | false;

    /**
     * @internal
     */
    public constructor(subtags: Subtags, iana: Iana.LanguageRegistries) {
        this._iana = iana;
        this._subtags = subtags;
    }

    /**
     * @public
     */
    public get primaryLanguage(): Iana.LanguageSubtags.Model.RegisteredLanguage | undefined {
        if (this._primaryLanguage === undefined) {
            this._primaryLanguage = this._iana.subtags.languages.tryGet(this._subtags.primaryLanguage) ?? false;
        }
        return this._primaryLanguage ? this._primaryLanguage : undefined;
    }

    /**
     * @public
     */
    public get extlangs(): Iana.LanguageSubtags.Model.RegisteredExtLang[] | undefined {
        if (this._extlangs === undefined) {
            if (this._subtags.extlangs !== undefined) {
                this._extlangs = this._subtags.extlangs
                    .map((e) => this._iana.subtags.extlangs.tryGet(e))
                    .filter((e): e is Iana.LanguageSubtags.Model.RegisteredExtLang => e !== undefined);
            }
            if (!this._subtags.extlangs || this._subtags.extlangs.length === 0) {
                this._extlangs = false;
            }
        }
        return this._extlangs ? this._extlangs : undefined;
    }

    public get script(): Iana.LanguageSubtags.Model.RegisteredScript | undefined {
        if (this._script === undefined) {
            if (this._subtags.script) {
                this._script = this._iana.subtags.scripts.tryGet(this._subtags.script);
            }
            if (!this._script) {
                const suppressed = this.primaryLanguage?.suppressScript;
                if (suppressed) {
                    this._script = this._iana.subtags.scripts.tryGet(suppressed);
                }
            }
            if (!this._script) {
                this._script = false;
            }
        }
        return this._script ? this._script : undefined;
    }

    public get region(): Iana.LanguageSubtags.Model.RegisteredRegion | undefined {
        if (this._region === undefined) {
            if (this._subtags.region) {
                this._region = this._iana.subtags.regions.tryGet(this._subtags.region);
            }
            if (!this._region) {
                this._region = false;
            }
        }
        return this._region ? this._region : undefined;
    }

    public get grandfathered(): Iana.LanguageSubtags.Model.RegisteredGrandfatheredTag | undefined {
        if (this._grandfathered === undefined) {
            if (this._subtags.grandfathered) {
                this._grandfathered = this._iana.subtags.grandfathered.tryGet(this._subtags.grandfathered);
            }
            if (!this._grandfathered) {
                this._grandfathered = false;
            }
        }
        return this._grandfathered ? this._grandfathered : undefined;
    }

    public toString(): string {
        return subtagsToString(this._subtags);
    }
}
