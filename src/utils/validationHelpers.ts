/*
 * Copyright (c) 2021 Erik Fortune
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

import { Converter, Converters, Result, Validation, fail, succeed } from '@fgv/ts-utils';
import { TypeGuardWithContext } from '@fgv/ts-utils/validation';

/**
 * A function which accepts a value of the expected type and reformats it to match
 * the canonical presentation form.
 * @public
 */
export type Normalizer<T extends string, TC = unknown> = (val: T, context?: TC) => Result<T>;

/**
 * Initializer for {@link Utils.ValidationHelpers | validation helpers}.
 * @public
 */
export interface ValidationHelpersConstructorParams<T extends string, TC = unknown> {
    description: string;
    isWellFormed: Validation.TypeGuardWithContext<T, TC>;
    isCanonical: Validation.TypeGuardWithContext<T, TC>;
    toCanonical?: Normalizer<T, TC>;
}

/**
  A collection of validation and normalization helpers for constrained string
  types.
 * @public
 */
export class ValidationHelpers<T extends string, TC = unknown> {
    /**
     * Describes the group of tags validated by these helpers.
     */
    public readonly description: string;

    /**
     * A `Convereter` which converts `unknown` to the tag type
     * validated by these helpers, if possible.
     */
    public readonly converter: Converter<T, TC>;

    /**
     * Determines is a supplied tag is well-formed according to the
     * lexical rules defined for the tag validated by these helpers.
     */
    public readonly isWellFormed: TypeGuardWithContext<T, TC>;

    /**
     * Determines is a supplied tag is well-formed and uses canonical
     * formatting, according to the lexical rules defined for the tag
     * validated by these helpers.
     */
    public readonly isCanonical: TypeGuardWithContext<T, TC>;

    /**
     * @internal
     */
    protected readonly _toCanonical?: Normalizer<T, TC>;

    /**
     * Constructs new {@link Utils.ValidationHelpers | validation helpers}
     * from supplied initializers.
     * @param init - The {@link Utils.ValidationHelpersConstructorParams | constructor params}
     * used to initialize this {@link Utils.ValidationHelpers | validation helpers}.
     */
    public constructor(init: ValidationHelpersConstructorParams<T, TC>) {
        this.description = init.description;
        this.isWellFormed = init.isWellFormed;
        this.isCanonical = init.isCanonical;
        this._toCanonical = init.toCanonical;
        this.converter = Converters.isA(this.description, this.isWellFormed);
    }

    /**
     * Converts a supplied `unknown` to the canonical form of the tag
     * validated by these helpers.
     * @param from - The `unknown` to be converted.
     * @param context - Optional context used in the conversion.
     * @returns `Success` with the corresponding canonical value,
     * or `Failure` with details if an error occurs.
     */
    public toCanonical(from: unknown, context?: TC): Result<T> {
        if (this.isWellFormed(from, context)) {
            if (this._toCanonical) {
                return this._toCanonical(from, context);
            }
            if (this.isCanonical(from, context)) {
                return succeed(from);
            }
            // istanbul ignore next
            return fail(`cannot convert "${from}" to canonical ${this.description}`);
        }
        return fail(`invalid ${this.description} ("${JSON.stringify(from)}")`);
    }

    /**
     * Determints if a supplied `unknown` is a well-formed representation
     * of the tag validated by these helpers.
     * @param from - The `unknown` to be validated.
     * @param context - Optional context used in the validation.
     * @returns `Success` with the validated value, or `Failure` with details
     * if an error occurs.
     */
    public verifyIsWellFormed(from: unknown, context?: TC): Result<T> {
        if (this.isWellFormed(from, context)) {
            return succeed(from);
        }
        return fail(`malformed ${this.description}`);
    }

    /**
     * Determints if a supplied `unknown` is a well-formed, canonical representation
     * of the tag validated by these helpers.
     * @param from - The `unknown` to be validated.
     * @param context - Optional context used in the validation.
     * @returns `Success` with the validated canonical value, or `Failure` with
     * details if an error occurs.
     */
    public verifyIsCanonical(from: unknown, context?: TC): Result<T> {
        if (this.isCanonical(from, context)) {
            return succeed(from);
        }
        // istanbul ignore next - should never occur and very hard to test
        if (!this.isWellFormed(from, context)) {
            return fail(`malformed ${this.description}`);
        }
        return fail(`non-canonical ${this.description}`);
    }
}

/**
 * @internal
 */
export interface RegExpValidationHelperConstructorParams<T extends string, TC = unknown> {
    description: string;
    wellFormed: RegExp;
    canonical: RegExp;
    toCanonical?: Normalizer<T, TC>;
}

/**
 * @internal
 */
export class RegExpValidationHelpers<T extends string, TC = unknown> extends ValidationHelpers<T, TC> {
    public readonly wellFormed: RegExp;
    public readonly canonical: RegExp;

    public constructor(params: RegExpValidationHelperConstructorParams<T, TC>) {
        super({
            description: params.description,
            toCanonical: params.toCanonical,
            isWellFormed: (from: unknown): from is T => {
                return typeof from === 'string' && this.wellFormed.test(from);
            },
            isCanonical: (from: unknown): from is T => {
                return typeof from === 'string' && this.canonical.test(from);
            },
        });
        this.wellFormed = params.wellFormed;
        this.canonical = params.canonical;
    }
}
