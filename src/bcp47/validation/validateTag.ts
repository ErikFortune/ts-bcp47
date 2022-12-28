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

import { Result, succeed } from '@fgv/ts-utils';
import { TagValidity, compareValidity } from '../status';

import { IsStrictlyValidValidator } from './isStrictlyValid';
import { IsValidValidator } from './isValid';
import { IsWellFormedValidator } from './isWellFormed';
import { LanguageTagParts } from '../common';
import { TagValidator } from './baseValidator';

export class ValidateTag {
    protected static _validators: Record<TagValidity, TagValidator> | undefined = undefined;

    public static isStrictlyValid(parts: LanguageTagParts) {
        return this.checkParts(parts, 'strictly-valid');
    }

    public static isValid(parts: LanguageTagParts) {
        return this.checkParts(parts, 'valid');
    }

    public static isWellFormed(parts: LanguageTagParts) {
        return this.checkParts(parts, 'well-formed');
    }

    public static chooseValidator(wantValidity: TagValidity, haveValidity?: TagValidity): TagValidator | undefined {
        if (haveValidity && compareValidity(haveValidity, wantValidity) > 0) {
            return undefined;
        }

        if (!this._validators) {
            this._validators = {
                /* eslint-disable @typescript-eslint/naming-convention */
                unknown: new IsWellFormedValidator(),
                'well-formed': new IsWellFormedValidator(),
                valid: new IsValidValidator(),
                'strictly-valid': new IsStrictlyValidValidator(),
                /* eslint-enable @typescript-eslint/naming-convention */
            };
        }
        return this._validators![wantValidity];
    }

    public static checkParts(parts: LanguageTagParts, wantValidity: TagValidity, haveValidity?: TagValidity): Result<boolean> {
        const validator = this.chooseValidator(wantValidity, haveValidity);
        return validator?.checkParts(parts) ?? succeed(true);
    }
}
