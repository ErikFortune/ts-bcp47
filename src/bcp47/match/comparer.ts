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

import * as Iana from '../../iana';
import * as Unsd from '../../unsd';

import { DefaultRegistries, OverridesRegistry } from '../overrides';
import { GlobalRegion, LanguageTagParts } from '../common';
import { IsoAlpha2RegionCode, UnM49RegionCode } from '../../iana/model';
import { LanguageSubtag, RegionSubtag } from '../../iana/language-subtags';
import { LanguageTag, LanguageTagInitOptions } from '../languageTag';
import { Result, succeed } from '@fgv/ts-utils';

import { matchQuality } from './common';

/**
 * Helper to compare two language tags to determine how closely related they are,
 * applying normalization and language semantics as appropriate.
 * @public
 */
export class LanguageComparer {
    public iana: Iana.LanguageRegistries;
    public unsd: Unsd.RegionCodes;
    public overrides: OverridesRegistry;

    public constructor(iana?: Iana.LanguageRegistries) {
        // istanbul ignore next
        this.iana = iana ?? Iana.DefaultRegistries.languageRegistries;
        this.unsd = Unsd.DefaultRegistries.regionCodes;
        this.overrides = DefaultRegistries.overridesRegistry;
    }

    public compareLanguageTags(t1: LanguageTag, t2: LanguageTag): number {
        // no primary tag is either all private or grandfathered, which must match
        // exactly.
        if (!t1.parts.primaryLanguage || !t2.parts.primaryLanguage) {
            return t1.toString().toLowerCase() === t2.toString().toLowerCase() ? matchQuality.exact : matchQuality.none;
        }

        let quality = this.comparePrimaryLanguage(t1, t2);
        quality = quality > matchQuality.none ? Math.min(this.compareExtlang(t1, t2), quality) : quality;
        quality = quality > matchQuality.none ? Math.min(this.compareScript(t1, t2), quality) : quality;
        quality = quality > matchQuality.none ? Math.min(this.compareRegion(t1, t2), quality) : quality;
        quality = quality > matchQuality.none ? Math.min(this.compareVariants(t1, t2), quality) : quality;
        quality = quality > matchQuality.none ? Math.min(this.compareExtensions(t1, t2), quality) : quality;
        quality = quality > matchQuality.none ? Math.min(this.comparePrivateUseTags(t1, t2), quality) : quality;

        return quality;
    }

    public compare(
        t1: LanguageTagParts | LanguageTag | string,
        t2: LanguageTagParts | LanguageTag | string,
        options?: LanguageTagInitOptions
    ): Result<number> {
        const tag1 = t1 instanceof LanguageTag ? succeed(t1) : LanguageTag.create(t1, options);
        const tag2 = t2 instanceof LanguageTag ? succeed(t2) : LanguageTag.create(t2, options);

        return tag1.onSuccess((lt1) => {
            return tag2.onSuccess((lt2) => {
                return succeed(this.compareLanguageTags(lt1, lt2));
            });
        });
    }

    public comparePrimaryLanguage(lt1: LanguageTag, lt2: LanguageTag): number {
        // istanbul ignore next
        const l1 = lt1.parts.primaryLanguage?.toLowerCase();
        // istanbul ignore next
        const l2 = lt2.parts.primaryLanguage?.toLowerCase();

        if (l1 == l2) {
            return matchQuality.exact;
        }

        if (lt1.isUndetermined || lt2.isUndetermined) {
            return matchQuality.undetermined;
        }

        return matchQuality.none;
    }

    public compareExtlang(lt1: LanguageTag, lt2: LanguageTag): number {
        if (lt1.parts.extlangs?.length !== lt2.parts.extlangs?.length) {
            return matchQuality.none;
        }

        if (lt1.parts.extlangs) {
            for (let i = 0; i < lt1.parts.extlangs.length; i++) {
                if (lt1.parts.extlangs[i].toLowerCase() !== lt2.parts.extlangs![i].toLowerCase()) {
                    return matchQuality.none;
                }
            }
        }

        return matchQuality.exact;
    }

    public compareScript(lt1: LanguageTag, lt2: LanguageTag): number {
        const s1 = lt1.effectiveScript?.toLowerCase();
        const s2 = lt2.effectiveScript?.toLowerCase();

        if (s1 === s2) {
            return matchQuality.exact;
        }

        if (lt1.isUndetermined || lt2.isUndetermined) {
            return matchQuality.undetermined;
        }

        return matchQuality.none;
    }

    public compareRegion(lt1: LanguageTag, lt2: LanguageTag): number {
        const r1 = lt1.parts.region?.toUpperCase() as RegionSubtag;
        const r2 = lt2.parts.region?.toUpperCase() as RegionSubtag;

        if (r1 === r2) {
            return matchQuality.exact;
        }

        // region 001 is equivalent to neutral (no region)
        if (r1 === GlobalRegion || r2 === GlobalRegion) {
            // if one tag is 001 and the other in neutral, exact match
            // otherwise, one tag is 001 so neutral region match
            return !r1 || !r2 ? matchQuality.exact : matchQuality.neutralRegion;
        }

        if (!r1 || !r2) {
            return matchQuality.neutralRegion;
        }

        // macro-region match
        const r1IsMacroRegion = Iana.Validate.unM49RegionCode.isWellFormed(r1);
        const r2IsMacroRegion = Iana.Validate.unM49RegionCode.isWellFormed(r2);
        if (r1IsMacroRegion || r2IsMacroRegion) {
            let contained: Unsd.CountryOrArea | Unsd.Region | undefined;
            let container: Unsd.Region | undefined;
            if (r1IsMacroRegion) {
                container = this.unsd.regions.tryGetRegion(r1 as unknown as UnM49RegionCode);
                contained =
                    this.unsd.areas.tryGetAlpha2Area(r2 as unknown as IsoAlpha2RegionCode) ??
                    this.unsd.tryGetRegionOrArea(r2 as unknown as UnM49RegionCode);
            } else {
                container = this.unsd.regions.tryGetRegion(r2 as unknown as UnM49RegionCode);
                contained = this.unsd.areas.tryGetAlpha2Area(r1 as unknown as IsoAlpha2RegionCode);
            }
            if (container && contained) {
                if (this.unsd.getIsContained(container, contained)) {
                    return matchQuality.macroRegion;
                }

                // if they're both regions, also check to see if the second region contains the
                // first
                if (contained.tier !== 'area' && this.unsd.getIsContained(contained, container)) {
                    return matchQuality.macroRegion;
                }
            }
        }

        // istanbul ignore next
        const o1 = this.overrides.overrides.get(lt1.parts.primaryLanguage?.toLowerCase() as LanguageSubtag);
        // istanbul ignore next
        const o2 = this.overrides.overrides.get(lt2.parts.primaryLanguage?.toLowerCase() as LanguageSubtag);

        // orthographic affinity
        if (o1 && o2) {
            // istanbul ignore next
            const a1 = o1.affinity?.get(r1) ?? o1.defaultAffinity;
            // istanbul ignore next
            const a2 = o2.affinity?.get(r2) ?? o2.defaultAffinity;
            if (a1 && a2 && a1 === a2) {
                return matchQuality.affinity;
            }
        }

        // preferred region
        if (o1?.preferredRegion === r1 || o2?.preferredRegion === r2) {
            return matchQuality.preferredRegion;
        }

        return matchQuality.sibling;
    }

    public compareVariants(lt1: LanguageTag, lt2: LanguageTag): number {
        if (lt1.parts.variants?.length !== lt2.parts.variants?.length) {
            return matchQuality.region;
        }

        if (lt1.parts.variants) {
            for (let i = 0; i < lt1.parts.variants.length; i++) {
                if (lt1.parts.variants[i].toLowerCase() !== lt2.parts.variants![i].toLowerCase()) {
                    return matchQuality.region;
                }
            }
        }

        return matchQuality.exact;
    }

    public compareExtensions(lt1: LanguageTag, lt2: LanguageTag): number {
        if (lt1.parts.extensions?.length !== lt2.parts.extensions?.length) {
            return matchQuality.variant;
        }

        if (lt1.parts.extensions) {
            for (let i = 0; i < lt1.parts.extensions.length; i++) {
                if (
                    lt1.parts.extensions[i].singleton.toLowerCase() !== lt2.parts.extensions![i].singleton.toLowerCase() ||
                    lt1.parts.extensions[i].value.toLowerCase() !== lt2.parts.extensions![i].value.toLowerCase()
                ) {
                    return matchQuality.variant;
                }
            }
        }

        return matchQuality.exact;
    }

    public comparePrivateUseTags(lt1: LanguageTag, lt2: LanguageTag): number {
        if (lt1.parts.privateUse?.length !== lt2.parts.privateUse?.length) {
            return matchQuality.variant;
        }

        if (lt1.parts.privateUse) {
            for (let i = 0; i < lt1.parts.privateUse.length; i++) {
                if (lt1.parts.privateUse[i].toLowerCase() !== lt2.parts.privateUse![i].toLowerCase()) {
                    return matchQuality.variant;
                }
            }
        }

        return matchQuality.exact;
    }
}
