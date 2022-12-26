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

import { LanguageTagInfo, LanguageTagParts } from './common';
import { Result, allSucceed, captureResult } from '@fgv/ts-utils';

import { PreferredTag } from './preferredTag';
import { ScriptSubtag } from '../iana/language-subtags';
import { ValidTag } from './validTag';
import { WellFormedTag } from './wellFormedTag';

export class LanguageTag {
    protected readonly _iana: Iana.IanaRegistries;

    protected readonly _wellFormed: WellFormedTag;
    protected _valid?: Result<ValidTag>;
    protected _canonical?: Result<PreferredTag>;
    protected _isStrictlyValid?: Result<true>;

    protected _inferredScript?: ScriptSubtag | false;

    protected constructor(wellFormed: WellFormedTag, iana: Iana.IanaRegistries) {
        this._wellFormed = wellFormed;
        this._iana = iana;
        this._valid = undefined;
        this._canonical = undefined;
    }

    public get script(): ScriptSubtag | undefined {
        const script = this.canonical?.parts.script;
        if (script !== undefined) {
            return script;
        }

        if (this._inferredScript === undefined) {
            const primaryLanguage = this.canonical?.parts.primaryLanguage;
            if (primaryLanguage) {
                const language = this._iana.subtags.languages.tryGet(primaryLanguage);
                this._inferredScript = language?.suppressScript ?? false;
            }
        }
        return this._inferredScript ? this._inferredScript : undefined;
    }

    public get wellFormed(): LanguageTagInfo {
        return this._wellFormed;
    }

    public get validated(): LanguageTagInfo | undefined {
        return this.validate().getValueOrDefault();
    }

    public get canonical(): LanguageTagInfo | undefined {
        return this.normalize().getValueOrDefault();
    }

    public get isValid(): boolean {
        return this.validate().isSuccess();
    }

    public get isStrictlyValid(): boolean {
        return this.strictValidate().isSuccess();
    }

    public static create(tag: string, iana: Iana.IanaRegistries): Result<LanguageTag>;
    public static create(parts: LanguageTagParts, iana: Iana.IanaRegistries): Result<LanguageTag>;
    public static create(tagOrParts: string | LanguageTagParts, iana: Iana.IanaRegistries): Result<LanguageTag> {
        return WellFormedTag.create(tagOrParts as string, iana).onSuccess((wellFormed) => {
            return captureResult(() => new LanguageTag(wellFormed, iana));
        });
    }

    public validate(): Result<LanguageTagInfo> {
        if (this._valid === undefined) {
            this._valid = ValidTag.create(this._wellFormed.parts, this._iana);
        }
        return this._valid;
    }

    public strictValidate(): Result<LanguageTagInfo> {
        return this.validate().onSuccess((valid) => {
            return allSucceed(
                [ValidTag.validateExtlangPrefix(valid.parts, this._iana), ValidTag.validateVariantPrefix(valid.parts, this._iana)],
                valid
            );
        });
    }

    public normalize(): Result<LanguageTagInfo> {
        if (this._canonical === undefined) {
            const validated = this.validate();
            if (validated.isSuccess()) {
                this._canonical = PreferredTag.create(validated.value, this._iana);
            } else {
                this._canonical = fail(validated.message);
            }
        }
        return this._canonical;
    }
}
